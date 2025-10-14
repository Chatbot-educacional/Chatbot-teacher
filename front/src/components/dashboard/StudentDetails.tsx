import { X, User, Target, Clock, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StudentDetailsProps {
  student: any;
  onClose: () => void;
}

export function StudentDetails({ student, onClose }: StudentDetailsProps) {
  const studentDetails = {
    totalQuestions: 156,
    accuracy: student.accuracy,
    difficultTopic: "Ponteiros em C",
    mostStudiedLanguage: "Python",
    totalTime: student.totalTime,
    lastActivity: "Resolveu 3 exercícios de Python - Arrays"
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes de {student.name}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total de Questões */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">Total de Questões Respondidas</span>
              </div>
              <div className="text-2xl font-bold text-primary">{studentDetails.totalQuestions}</div>
            </div>

            {/* Taxa de Acertos */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                <span className="font-medium">Taxa de Acertos</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={studentDetails.accuracy} className="flex-1" />
                <span className="text-lg font-bold text-success">{studentDetails.accuracy}%</span>
              </div>
            </div>

            {/* Conteúdo com Mais Dificuldade */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-warning" />
                <span className="font-medium">Conteúdo com Mais Dificuldade</span>
              </div>
              <Badge variant="secondary" className="bg-warning-light text-warning">
                {studentDetails.difficultTopic}
              </Badge>
            </div>

            {/* Linguagem Mais Estudada */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">Linguagem Mais Estudada</span>
              </div>
              <Badge variant="secondary" className="bg-primary-light text-primary">
                {studentDetails.mostStudiedLanguage}
              </Badge>
            </div>

            {/* Tempo Total */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Tempo Total na Plataforma</span>
              </div>
              <div className="text-xl font-bold text-primary">{studentDetails.totalTime}</div>
            </div>

            {/* Última Atividade */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Última Atividade</span>
              </div>
              <p className="text-sm text-muted-foreground">{studentDetails.lastActivity}</p>
              <p className="text-xs text-muted-foreground">{student.lastActivity}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button className="flex-1">
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex-1">
              Sugerir Revisão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}