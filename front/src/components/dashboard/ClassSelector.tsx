import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Class } from "@/types/dashboard";

interface ClassSelectorProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
}

export function ClassSelector({ classes, selectedClass, onClassChange }: ClassSelectorProps) {
  const currentClass = classes.find(c => c.id === selectedClass);

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Turma:</span>
          </div>
          
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione uma turma" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{classItem.name}</span>
                    {classItem.id !== "all" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({classItem.totalStudents} alunos)
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentClass && currentClass.id !== "all" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Código: {currentClass.code}</span>
              <span>•</span>
              <span>{currentClass.totalStudents} alunos</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}