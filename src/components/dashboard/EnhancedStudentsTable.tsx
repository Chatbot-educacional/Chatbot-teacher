import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, User } from "lucide-react";
import { StudentAnalytics, Subject } from "@/types/dashboard";

interface EnhancedStudentsTableProps {
  students: StudentAnalytics[];
  subjects: Subject[];
  selectedSubject: string;
  onStudentClick: (student: StudentAnalytics) => void;
}

export function EnhancedStudentsTable({ 
  students, 
  subjects, 
  selectedSubject, 
  onStudentClick 
}: EnhancedStudentsTableProps) {
  const [activeTab, setActiveTab] = useState("performance");

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-success";
    if (accuracy >= 60) return "text-warning";
    return "text-destructive";
  };

  const getSubjectPerformance = (student: StudentAnalytics, subjectId: string) => {
    if (subjectId === "all") {
      return {
        accuracy: student.overallAccuracy,
        correctAnswers: student.subjectPerformances.reduce((sum, p) => sum + p.correctAnswers, 0),
        totalQuestions: student.subjectPerformances.reduce((sum, p) => sum + p.totalQuestions, 0)
      };
    }
    
    const performance = student.subjectPerformances.find(p => p.subjectId === subjectId);
    return performance ? {
      accuracy: performance.accuracy,
      correctAnswers: performance.correctAnswers,
      totalQuestions: performance.totalQuestions
    } : { accuracy: 0, correctAnswers: 0, totalQuestions: 0 };
  };

  const getSubjectBadgeColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || "hsl(var(--muted-foreground))";
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Análise Detalhada dos Alunos
          {selectedSubject !== "all" && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              - {subjects.find(s => s.id === selectedSubject)?.name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="participation">Participação</TabsTrigger>
            <TabsTrigger value="difficulty">Dificuldades</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Acertos (%)</TableHead>
                  <TableHead>Questões (Corretas/Total)</TableHead>
                  <TableHead>Tempo Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const performance = getSubjectPerformance(student, selectedSubject);
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={performance.accuracy} className="w-16 h-2" />
                          <span className={`text-sm font-medium ${getAccuracyColor(performance.accuracy)}`}>
                            {performance.accuracy}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {performance.correctAnswers}/{performance.totalQuestions}
                        </span>
                      </TableCell>
                      <TableCell>
                        {selectedSubject === "all" ? student.totalTime : 
                         student.subjectPerformances.find(p => p.subjectId === selectedSubject)?.totalTime || "0h 0m"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onStudentClick(student)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="participation">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Perguntas Feitas</TableHead>
                  <TableHead>Respostas Dadas</TableHead>
                  <TableHead>Total Participações</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .sort((a, b) => b.forumInteractions.totalParticipations - a.forumInteractions.totalParticipations)
                  .map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary-light text-primary">
                          {student.forumInteractions.questionsAsked}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-success-light text-success">
                          {student.forumInteractions.answersGiven}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-warning-light text-warning">
                          {student.forumInteractions.totalParticipations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.forumInteractions.lastActivity}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onStudentClick(student)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Ver Participações
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="difficulty">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tópicos com Dificuldade</TableHead>
                  <TableHead>Menor Acerto (Matéria)</TableHead>
                  <TableHead>Nível com Mais Erros</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .sort((a, b) => a.overallAccuracy - b.overallAccuracy)
                  .map((student) => {
                    const worstSubject = student.subjectPerformances.reduce((worst, current) => 
                      current.accuracy < worst.accuracy ? current : worst
                    );
                    
                    const mostErrorsLevel = worstSubject.questionLevels.reduce((worst, current) => 
                      (current.incorrect / current.total) > (worst.incorrect / worst.total) ? current : worst
                    );

                    return (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.difficultTopics.slice(0, 2).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="bg-destructive-light text-destructive text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {student.difficultTopics.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{student.difficultTopics.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getSubjectBadgeColor(worstSubject.subjectId) }}
                            />
                            <span className="text-sm">{worstSubject.subjectName}</span>
                            <span className={`text-sm font-medium ${getAccuracyColor(worstSubject.accuracy)}`}>
                              ({worstSubject.accuracy}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-warning-light text-warning capitalize">
                            {mostErrorsLevel.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onStudentClick(student)}
                          >
                            Sugerir Revisão
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}