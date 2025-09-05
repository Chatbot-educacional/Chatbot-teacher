import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const studentsData = [
  {
    id: 1,
    name: "Ana Silva",
    accuracy: 85,
    totalTime: "12h 30m",
    bestLanguage: "Python",
    lastActivity: "2024-01-20 14:30"
  },
  {
    id: 2,
    name: "Carlos Santos",
    accuracy: 72,
    totalTime: "8h 45m",
    bestLanguage: "Java",
    lastActivity: "2024-01-20 13:15"
  },
  {
    id: 3,
    name: "Maria Oliveira",
    accuracy: 91,
    totalTime: "15h 20m",
    bestLanguage: "C",
    lastActivity: "2024-01-20 16:22"
  },
  {
    id: 4,
    name: "João Pedro",
    accuracy: 68,
    totalTime: "6h 15m",
    bestLanguage: "Python",
    lastActivity: "2024-01-19 19:45"
  },
  {
    id: 5,
    name: "Letícia Costa",
    accuracy: 79,
    totalTime: "10h 12m",
    bestLanguage: "Java",
    lastActivity: "2024-01-20 11:30"
  }
];

interface StudentsTableProps {
  onStudentClick: (student: any) => void;
}

export function StudentsTable({ onStudentClick }: StudentsTableProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-success";
    if (accuracy >= 60) return "text-warning";
    return "text-destructive";
  };

  const getLanguageBadgeColor = (language: string) => {
    switch (language) {
      case "Python": return "bg-blue-100 text-blue-800";
      case "Java": return "bg-orange-100 text-orange-800";
      case "C": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Desempenho dos Alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Acertos</TableHead>
              <TableHead>Tempo Total</TableHead>
              <TableHead>Melhor Linguagem</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsData.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={student.accuracy} className="w-16 h-2" />
                    <span className={`text-sm font-medium ${getAccuracyColor(student.accuracy)}`}>
                      {student.accuracy}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>{student.totalTime}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getLanguageBadgeColor(student.bestLanguage)}
                  >
                    {student.bestLanguage}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {student.lastActivity}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStudentClick(student)}
                  >
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}