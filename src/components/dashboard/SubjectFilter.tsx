import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/types/dashboard";

interface SubjectFilterProps {
  subjects: Subject[];
  selectedSubject: string;
  sortBy: string;
  sortOrder: 'desc' | 'asc';
  onSubjectChange: (subjectId: string) => void;
  onSortChange: (sortBy: string) => void;
  onSortOrderToggle: () => void;
}

export function SubjectFilter({ 
  subjects, 
  selectedSubject, 
  sortBy, 
  sortOrder,
  onSubjectChange, 
  onSortChange,
  onSortOrderToggle
}: SubjectFilterProps) {
  const sortOptions = [
    { value: "accuracy", label: "Desempenho" },
    { value: "participation", label: "Participação" },
    { value: "difficulty", label: "Dificuldade" },
    { value: "time", label: "Tempo de Estudo" }
  ];

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Matéria:</span>
          </div>
          
          <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione uma matéria" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span>{subject.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Ordenar por:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={onSortOrderToggle}
              className="flex items-center gap-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'desc' ? 'Desc' : 'Asc'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}