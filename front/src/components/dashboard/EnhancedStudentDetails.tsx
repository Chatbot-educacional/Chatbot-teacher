import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  User, 
  Clock, 
  MessageCircle, 
  Send, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Award
} from "lucide-react";
import { StudentAnalytics, Subject } from "@/types/dashboard";

interface EnhancedStudentDetailsProps {
  student: StudentAnalytics;
  subjects: Subject[];
  onClose: () => void;
}

export function EnhancedStudentDetails({ student, subjects, onClose }: EnhancedStudentDetailsProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-success";
    if (accuracy >= 60) return "text-warning";
    return "text-destructive";
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || "hsl(var(--muted-foreground))";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'básico': return "bg-success-light text-success";
      case 'intermediário': return "bg-warning-light text-warning";
      case 'avançado': return "bg-destructive-light text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-light rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">{student.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Análise Detalhada de Desempenho
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Acerto Geral</p>
                  <p className={`text-2xl font-bold ${getAccuracyColor(student.overallAccuracy)}`}>
                    {student.overallAccuracy}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Tempo Total</p>
                  <p className="text-2xl font-bold">{student.totalTime}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Participações</p>
                  <p className="text-2xl font-bold">{student.forumInteractions.totalParticipations}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium">Dificuldades</p>
                  <p className="text-2xl font-bold">{student.difficultTopics.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="subjects" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjects">Por Matéria</TabsTrigger>
              <TabsTrigger value="levels">Níveis de Questões</TabsTrigger>
              <TabsTrigger value="participation">Participação</TabsTrigger>
              <TabsTrigger value="difficulties">Dificuldades</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-4">
              {student.subjectPerformances
                .sort((a, b) => b.accuracy - a.accuracy)
                .map((performance) => (
                  <Card key={performance.subjectId} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getSubjectColor(performance.subjectId) }}
                        />
                        <h3 className="font-semibold">{performance.subjectName}</h3>
                      </div>
                      <Badge variant="secondary" className={getAccuracyColor(performance.accuracy)}>
                        {performance.accuracy}% de acerto
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Questões Corretas</p>
                        <p className="text-xl font-bold text-success">
                          {performance.correctAnswers}/{performance.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
                        <p className="text-xl font-bold">{performance.totalTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <Progress value={performance.accuracy} className="mt-1" />
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="levels" className="space-y-4">
              {student.subjectPerformances.map((performance) => (
                <Card key={`levels-${performance.subjectId}`} className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getSubjectColor(performance.subjectId) }}
                    />
                    <h3 className="font-semibold">{performance.subjectName}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performance.questionLevels
                      .sort((a, b) => (b.incorrect / b.total) - (a.incorrect / a.total))
                      .map((level) => {
                        const errorRate = ((level.incorrect / level.total) * 100).toFixed(1);
                        const successRate = ((level.correct / level.total) * 100).toFixed(1);
                        
                        return (
                          <Card key={level.level} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`capitalize ${getLevelColor(level.level)}`}>
                                {level.level}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {level.total} questões
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-success">Acertos:</span>
                                <span className="font-medium">{level.correct} ({successRate}%)</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-destructive">Erros:</span>
                                <span className="font-medium">{level.incorrect} ({errorRate}%)</span>
                              </div>
                              <Progress value={parseFloat(successRate)} className="h-2" />
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="participation" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Atividade no Fórum e Chat
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary-light rounded-lg">
                    <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary">{student.forumInteractions.questionsAsked}</p>
                    <p className="text-sm text-muted-foreground">Perguntas Feitas</p>
                  </div>
                  
                  <div className="text-center p-4 bg-success-light rounded-lg">
                    <Send className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-success">{student.forumInteractions.answersGiven}</p>
                    <p className="text-sm text-muted-foreground">Respostas Dadas</p>
                  </div>
                  
                  <div className="text-center p-4 bg-warning-light rounded-lg">
                    <Target className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold text-warning">{student.forumInteractions.totalParticipations}</p>
                    <p className="text-sm text-muted-foreground">Total de Participações</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Última atividade: <span className="font-medium">{student.forumInteractions.lastActivity}</span>
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="difficulties" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Tópicos com Maior Dificuldade
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {student.difficultTopics.map((topic, index) => (
                    <Card key={index} className="p-3 bg-destructive-light">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">{topic}</span>
                      </div>
                    </Card>
                  ))}
                </div>

                {student.difficultTopics.length === 0 && (
                  <div className="text-center p-6 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2" />
                    <p>Parabéns! Este aluno não apresenta dificuldades significativas.</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Sugerir Revisão
            </Button>
            <Button variant="outline" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}