import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentAnalytics, Subject } from "@/types/dashboard";

interface DifficultTopicsProps {
  students: StudentAnalytics[];
  selectedSubject: string;
  subjects: Subject[];
}

export function DifficultTopics({ students, selectedSubject, subjects }: DifficultTopicsProps) {
  // Calculate difficult topics based on selected subject and students
  const calculateDifficultTopics = () => {
    const topicCounts: { [key: string]: { total: number; subject: string } } = {};
    
    // Count occurrences of difficult topics
    students.forEach(student => {
      student.difficultTopics.forEach(topic => {
        if (!topicCounts[topic]) {
          topicCounts[topic] = { total: 0, subject: "Geral" };
        }
        topicCounts[topic].total += 1;
        
        // Try to associate topic with subject based on student's performance
        if (selectedSubject !== "all") {
          const subjectPerf = student.subjectPerformances.find(p => p.subjectId === selectedSubject);
          if (subjectPerf && subjectPerf.accuracy < 70) {
            const subjectName = subjects.find(s => s.id === selectedSubject)?.name || "Geral";
            topicCounts[topic].subject = subjectName;
          }
        } else {
          // For "all", try to infer subject from performance data
          const lowestPerf = student.subjectPerformances.reduce((min, curr) => 
            curr.accuracy < min.accuracy ? curr : min
          );
          if (lowestPerf.accuracy < 70) {
            topicCounts[topic].subject = lowestPerf.subjectName;
          }
        }
      });
    });
    
    // Convert to array and calculate error rates
    const topics = Object.entries(topicCounts)
      .map(([name, data]) => ({
        topic: name,
        errorRate: Math.min(95, Math.round((data.total / students.length) * 100)),
        language: data.subject
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5); // Top 5 most difficult
    
    return topics;
  };
  
  const difficultTopics = calculateDifficultTopics();
  
  const getLanguageColor = (language: string) => {
    switch (language) {
      case "Python": return "text-blue-600";
      case "Java": return "text-orange-600";
      case "C": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "Todas as Matérias";

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Conteúdos Mais Difíceis - {selectedSubjectName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {difficultTopics.length > 0 ? (
            difficultTopics.map((topic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{topic.topic}</span>
                    <span className={`ml-2 text-sm ${getLanguageColor(topic.language)}`}>
                      ({topic.language})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-destructive">
                    {topic.errorRate}% erro
                  </span>
                </div>
                <Progress 
                  value={topic.errorRate} 
                  className="h-2"
                  // Use a custom red color for error rate
                  style={{ 
                    '--progress-background': 'hsl(var(--destructive-light))',
                    '--progress-foreground': 'hsl(var(--destructive))'
                  } as any}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Nenhum tópico difícil identificado para esta seleção
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}