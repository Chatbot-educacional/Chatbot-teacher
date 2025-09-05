import { Users, Clock, Target, AlertTriangle, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalytics, Subject } from "@/types/dashboard";

interface SummaryCardsProps {
  students: StudentAnalytics[];
  selectedSubject: string;
  subjects: Subject[];
}

export function SummaryCards({ students, selectedSubject, subjects }: SummaryCardsProps) {
  // Calculate dynamic data based on filtered students and selected subject
  const calculateSummaryData = () => {
    const totalStudents = students.length;
    
    // Calculate average time and accuracy based on selected subject
    let totalTime = 0;
    let totalAccuracy = 0;
    let totalQuestions = 0;
    let totalParticipations = 0;
    let difficultTopicsCount: { [key: string]: number } = {};
    
    students.forEach(student => {
      if (selectedSubject === "all") {
        // For "all" subjects, use overall metrics
        const timeInMinutes = convertTimeToMinutes(student.totalTime);
        totalTime += timeInMinutes;
        totalAccuracy += student.overallAccuracy;
        
        // Count total questions across all subjects
        student.subjectPerformances.forEach(perf => {
          totalQuestions += perf.totalQuestions;
        });
        
        totalParticipations += student.forumInteractions.totalParticipations;
        
        // Count difficult topics
        student.difficultTopics.forEach(topic => {
          difficultTopicsCount[topic] = (difficultTopicsCount[topic] || 0) + 1;
        });
      } else {
        // For specific subject
        const subjectPerformance = student.subjectPerformances.find(
          perf => perf.subjectId === selectedSubject
        );
        
        if (subjectPerformance) {
          const timeInMinutes = convertTimeToMinutes(subjectPerformance.totalTime);
          totalTime += timeInMinutes;
          totalAccuracy += subjectPerformance.accuracy;
          totalQuestions += subjectPerformance.totalQuestions;
        }
        
        totalParticipations += student.forumInteractions.totalParticipations;
        
        // For subject-specific difficult topics, we'll show general difficult topics
        // but could be enhanced to be subject-specific in the future
        student.difficultTopics.forEach(topic => {
          difficultTopicsCount[topic] = (difficultTopicsCount[topic] || 0) + 1;
        });
      }
    });
    
    const avgTime = totalStudents > 0 ? Math.round(totalTime / totalStudents) : 0;
    const avgAccuracy = totalStudents > 0 ? Math.round(totalAccuracy / totalStudents) : 0;
    const avgParticipations = totalStudents > 0 ? Math.round(totalParticipations / totalStudents) : 0;
    
    // Find most difficult topic
    const mostDifficultTopic = Object.entries(difficultTopicsCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Nenhum";
    
    return {
      totalStudents,
      avgTime: formatTime(avgTime),
      avgAccuracy,
      totalQuestions,
      avgParticipations,
      mostDifficultTopic
    };
  };
  
  const convertTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.match(/(\d+)h\s*(\d+)m/);
    return parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0;
  };
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const data = calculateSummaryData();
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "Todas as Matérias";
  
  const summaryData = [
    {
      title: "Total de Alunos",
      value: data.totalStudents.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary-light"
    },
    {
      title: selectedSubject === "all" ? "Tempo Médio Online" : `Tempo Médio - ${selectedSubjectName}`,
      value: data.avgTime,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary-light"
    },
    {
      title: selectedSubject === "all" ? "Média de Acertos" : `Acertos - ${selectedSubjectName}`,
      value: `${data.avgAccuracy}%`,
      icon: Target,
      color: "text-success",
      bgColor: "bg-success-light"
    },
    {
      title: "Conteúdo Mais Difícil",
      value: data.mostDifficultTopic,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning-light"
    },
    {
      title: selectedSubject === "all" ? "Total de Questões" : `Questões - ${selectedSubjectName}`,
      value: data.totalQuestions.toLocaleString(),
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary-light"
    },
    {
      title: "Participações Médias",
      value: data.avgParticipations.toString(),
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary-light"
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {summaryData.map((item, index) => (
        <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}