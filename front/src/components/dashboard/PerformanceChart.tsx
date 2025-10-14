import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StudentAnalytics, Subject } from "@/types/dashboard";

interface PerformanceChartProps {
  students: StudentAnalytics[];
  selectedSubject: string;
  subjects: Subject[];
}

export function PerformanceChart({ students, selectedSubject, subjects }: PerformanceChartProps) {
  // Generate chart data based on selected subject
  const generateChartData = () => {
    // Simulate weekly progression data
    const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7"];
    
    return weeks.map((week, index) => {
      let avgAccuracy = 0;
      
      if (selectedSubject === "all") {
        // Calculate overall average accuracy with progression
        avgAccuracy = students.reduce((sum, student) => sum + student.overallAccuracy, 0) / students.length;
        // Simulate progression (starting lower and improving)
        avgAccuracy = Math.max(50, avgAccuracy - (6 - index) * 3 + Math.random() * 4 - 2);
      } else {
        // Calculate subject-specific average accuracy
        const subjectPerformances = students.map(student => 
          student.subjectPerformances.find(perf => perf.subjectId === selectedSubject)
        ).filter(Boolean);
        
        if (subjectPerformances.length > 0) {
          avgAccuracy = subjectPerformances.reduce((sum, perf) => sum + (perf?.accuracy || 0), 0) / subjectPerformances.length;
          // Simulate progression for specific subject
          avgAccuracy = Math.max(50, avgAccuracy - (6 - index) * 4 + Math.random() * 5 - 2.5);
        } else {
          avgAccuracy = 65 + index * 2; // Default progression
        }
      }
      
      return {
        week,
        acertos: Math.round(Math.max(50, Math.min(95, avgAccuracy)))
      };
    });
  };
  
  const chartData = generateChartData();
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "Todas as Matérias";
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Evolução da Turma - {selectedSubjectName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[50, 100]}
                className="text-sm"
                tick={{ fontSize: 12 }}
                label={{ value: '% Acertos', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="acertos" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}