import { pb } from "@/lib/pocketbase";
import type {
  GeneratedPlan,
  LessonPlanRecord,
  LessonRecord,
  Lesson,
} from "@/types/lessonPlan";

export async function saveLessonPlan(
  plan: LessonPlanRecord,
  lessons: Lesson[],
  generatedPlan: GeneratedPlan
): Promise<{ planId: string; lessonIds: string[] }> {
  const activeLessons = lessons.filter((lesson) => !lesson.isDeleted);
  const savedLessons = activeLessons.map((lesson) => {
    const savedLesson = { ...lesson };
    delete savedLesson.isDeleted;
    return savedLesson;
  });
  const fullPlan: GeneratedPlan = {
    ...generatedPlan,
    lessons: savedLessons,
  };
  const createdPlan = await pb.collection("lesson_plans").create({
    ...plan,
    full_plan: fullPlan,
  });

  if (!createdPlan.full_plan) {
    throw new Error(
      'A coleção "lesson_plans" precisa ter um campo JSON chamado "full_plan" para armazenar o conteúdo completo do plano.'
    );
  }

  const lessonIds: string[] = [];

  let classId: string | null = null;
  try {
    const classRecord = await pb.collection("classes").getFirstListItem(
      `code="${plan.course}" || name="${plan.course}"`
    );
    classId = classRecord.id;
  } catch (error) {
    console.warn(`Turma não encontrada para "${plan.course}":`, error);
  }

  for (const lesson of activeLessons) {
    const lessonRecord: LessonRecord = {
      lesson_order: lesson.lesson_order,
      lesson_plan_id: createdPlan.id,
      title: lesson.title,
      specific_objectives: lesson.specific_objectives,
      content: lesson.content,
      methodology: lesson.methodology,
      assessment: lesson.assessment,
      activity: lesson.activity,
    };
    const createdLesson = await pb.collection("lessons").create(lessonRecord);
    lessonIds.push(createdLesson.id);

    if (lesson.activity && classId) {
      const activity = lesson.activity;
      const instructions = `
${activity.description || ""}

${activity.instructions || ""}

Critérios de avaliação:
${activity.evaluation_criteria.join("\n")}
`;

      const activityData = {
        title: activity.activity_title || "Atividade",
        instructions,
        points: 0,
        dueDate: null,
        topic: plan.discipline,
        class: [classId],
        status: "em andamento",
        submittedCount: 0,
        totalStudents: 0,
        attachment: null,
      };
      await pb.collection("activities").create(activityData);
    }
  }

  return {
    planId: createdPlan.id,
    lessonIds,
  };
}