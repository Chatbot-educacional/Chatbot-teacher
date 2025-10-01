import { pb } from '@/lib/pocketbase';
import {
  ForumUserInteraction,
  ChatInteraction,
  ChatSession,
  DailyClassMetrics,
  ClassAnalyticsData,
  ForumInteractionType,
  ChatInteractionType
} from '@/types/dashboard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export class AnalyticsService {

  /**
   * Track forum interaction
   */
  static async trackForumInteraction(
    interactionType: ForumInteractionType,
    classId: string,
    userId: string,
    postId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await pb.collection('forum_user_interactions').create({
        user: userId,
        class: classId,
        interaction_type: interactionType,
        target_id: postId || '',
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Erro ao rastrear interação do fórum:', error);
      throw error;
    }
  }

  /**
   * Track chat interaction
   */
  static async trackChatInteraction(
    interactionType: ChatInteractionType,
    sessionId: string,
    userId: string,
    classId?: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await pb.collection('chat_interactions').create({
        user: userId,
        session: sessionId,
        class: classId || null,
        interaction_type: interactionType,
        target_id: targetId || '',
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Erro ao rastrear interação do chat:', error);
      throw error;
    }
  }

  /**
   * Update chat session context
   */
  static async updateChatSession(
    sessionId: string,
    classId?: string,
    subject?: string
  ): Promise<void> {
    try {
      await pb.collection('chat_sessions').update(sessionId, {
        class: classId || null,
        subject: subject || null,
        last_interaction: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao atualizar sessão do chat:', error);
      throw error;
    }
  }

  /**
   * Get forum interactions for a class
   */
  static async getForumInteractions(
    classId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ForumUserInteraction[]> {
    try {
      const filters = [`class = "${classId}"`];

      if (startDate) {
        filters.push(`created >= "${startDate.toISOString()}"`);
      }

      if (endDate) {
        filters.push(`created <= "${endDate.toISOString()}"`);
      }

      const records = await pb.collection('forum_user_interactions').getFullList({
        filter: filters.join(' && '),
        sort: 'created',
      });

      return records as unknown as ForumUserInteraction[];
    } catch (error) {
      console.error('Erro ao buscar interações do fórum:', error);
      return [];
    }
  }

  /**
   * Get chat interactions for a class
   */
  static async getChatInteractions(
    classId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ChatInteraction[]> {
    try {
      const filters = [`class = "${classId}"`];

      if (startDate) {
        filters.push(`created >= "${startDate.toISOString()}"`);
      }

      if (endDate) {
        filters.push(`created <= "${endDate.toISOString()}"`);
      }

      const records = await pb.collection('chat_interactions').getFullList({
        filter: filters.join(' && '),
        sort: 'created',
      });

      return records as unknown as ChatInteraction[];
    } catch (error) {
      console.error('Erro ao buscar interações do chat:', error);
      return [];
    }
  }

  /**
   * Get all interactions for a class (forum + chat)
   */
  static async getClassInteractions(
    classId: string,
    days: number = 7
  ): Promise<{
    forumInteractions: ForumUserInteraction[];
    chatInteractions: ChatInteraction[];
    total: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const [forumInteractions, chatInteractions] = await Promise.all([
        this.getForumInteractions(classId, startDate, endDate),
        this.getChatInteractions(classId, startDate, endDate),
      ]);

      return {
        forumInteractions,
        chatInteractions,
        total: forumInteractions.length + chatInteractions.length,
      };
    } catch (error) {
      console.error('Erro ao buscar interações da turma:', error);
      return {
        forumInteractions: [],
        chatInteractions: [],
        total: 0,
      };
    }
  }

  /**
   * Generate comprehensive analytics for a class
   */
  static async generateClassAnalytics(
    classId: string,
    className: string,
    days: number = 7
  ): Promise<ClassAnalyticsData> {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Get all interactions
      const { forumInteractions, chatInteractions } = await this.getClassInteractions(classId, days);

      // Get class info for total students
      const classInfo = await pb.collection('classes').getOne(classId);
      const totalStudents = classInfo.expand?.members?.length || 0;

      // Calculate unique active students
      const uniqueStudents = new Set([
        ...forumInteractions.map(i => i.user),
        ...chatInteractions.map(i => i.user)
      ]).size;

      // Calculate daily data
      const dailyData = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayStart = startOfDay(d);
        const dayEnd = endOfDay(d);

        const dayForumInteractions = forumInteractions.filter(i => {
          const created = new Date(i.created);
          return created >= dayStart && created <= dayEnd;
        });

        const dayChatInteractions = chatInteractions.filter(i => {
          const created = new Date(i.created);
          return created >= dayStart && created <= dayEnd;
        });

        dailyData.push({
          date: dateStr,
          interactions: dayForumInteractions.length + dayChatInteractions.length,
          forum_interactions: dayForumInteractions.length,
          chat_interactions: dayChatInteractions.length,
          active_students: new Set([
            ...dayForumInteractions.map(i => i.user),
            ...dayChatInteractions.map(i => i.user)
          ]).size,
        });
      }

      // Calculate student engagement
      const studentStats = new Map();
      [...forumInteractions, ...chatInteractions].forEach(interaction => {
        const userId = interaction.user;
        if (!studentStats.has(userId)) {
          studentStats.set(userId, {
            interactions: 0,
            last_activity: interaction.created,
          });
        }
        studentStats.get(userId).interactions++;
        const interactionDate = new Date(interaction.created);
        const lastActivity = new Date(studentStats.get(userId).last_activity);
        if (interactionDate > lastActivity) {
          studentStats.get(userId).last_activity = interaction.created;
        }
      });

      const studentEngagement = Array.from(studentStats.entries()).map(([studentId, stats]) => ({
        student_id: studentId,
        student_name: `Aluno ${studentId.slice(-4)}`, // Simplified for demo
        interactions: stats.interactions,
        last_activity: stats.last_activity,
        engagement_score: Math.min(stats.interactions * 10, 100), // Simple scoring
      })).sort((a, b) => b.interactions - a.interactions);

      // Calculate subject breakdown from chat interactions
      const subjectStats = new Map();
      chatInteractions.forEach(interaction => {
        const subject = interaction.metadata?.subject || 'Não especificado';
        if (!subjectStats.has(subject)) {
          subjectStats.set(subject, { interactions: 0, students: new Set() });
        }
        subjectStats.get(subject).interactions++;
        subjectStats.get(subject).students.add(interaction.user);
      });

      const subjectBreakdown = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
        subject,
        interactions: stats.interactions,
        students: stats.students.size,
      })).sort((a, b) => b.interactions - a.interactions);

      return {
        classId,
        className,
        metrics: {
          total_interactions: forumInteractions.length + chatInteractions.length,
          forum_interactions: forumInteractions.length,
          chat_interactions: chatInteractions.length,
          active_students: uniqueStudents,
          total_students: totalStudents,
          engagement_metrics: {
            participation_rate: totalStudents > 0 ? (uniqueStudents / totalStudents) * 100 : 0,
          },
          performance_metrics: {
            improvement_trend: 'stable', // Would need more complex calculation
          },
        },
        daily_data: dailyData,
        student_engagement: studentEngagement,
        subject_breakdown: subjectBreakdown,
      };
    } catch (error) {
      console.error('Erro ao gerar analytics da turma:', error);
      throw error;
    }
  }

  /**
   * Get student-specific analytics
   */
  static async getStudentAnalytics(
    studentId: string,
    classId?: string,
    days: number = 30
  ): Promise<{
    totalInteractions: number;
    forumInteractions: number;
    chatInteractions: number;
    subjects: string[];
    lastActivity: string;
    engagementScore: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const filters = [`user = "${studentId}"`];

      if (classId) {
        // For forum interactions
        const forumFilters = [`user = "${studentId}"`, `class = "${classId}"`, `created >= "${startDate.toISOString()}"`];
        const chatFilters = [`user = "${studentId}"`, `class = "${classId}"`, `created >= "${startDate.toISOString()}"`];

        const [forumInteractions, chatInteractions] = await Promise.all([
          pb.collection('forum_user_interactions').getFullList({
            filter: forumFilters.join(' && '),
          }),
          pb.collection('chat_interactions').getFullList({
            filter: chatFilters.join(' && '),
          }),
        ]);

        const totalInteractions = forumInteractions.length + chatInteractions.length;

        // Extract subjects from chat interactions
        const subjects = new Set(
          chatInteractions
            .map(i => i.metadata?.subject)
            .filter(Boolean)
        );

        const lastActivity = Math.max(
          ...forumInteractions.map(i => new Date(i.created).getTime()),
          ...chatInteractions.map(i => new Date(i.created).getTime())
        );

        return {
          totalInteractions,
          forumInteractions: forumInteractions.length,
          chatInteractions: chatInteractions.length,
          subjects: Array.from(subjects),
          lastActivity: new Date(lastActivity).toISOString(),
          engagementScore: Math.min(totalInteractions * 5, 100),
        };
      }

      return {
        totalInteractions: 0,
        forumInteractions: 0,
        chatInteractions: 0,
        subjects: [],
        lastActivity: new Date().toISOString(),
        engagementScore: 0,
      };
    } catch (error) {
      console.error('Erro ao buscar analytics do estudante:', error);
      throw error;
    }
  }
}
