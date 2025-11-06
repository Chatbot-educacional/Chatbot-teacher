import { Users, MessageSquare, Target, Activity, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassAnalyticsData } from "@/types/dashboard";



interface SummaryCardsProps {
  analyticsData: ClassAnalyticsData | null;
}

export function SummaryCards({ analyticsData }: SummaryCardsProps) {
  if (!analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carregando...
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { metrics, student_engagement } = analyticsData;

  // Encontrando o aluno com maior engajamento (o primeiro, já que está ordenado)
  const topStudent = student_engagement[0]?.student_name || "N/A";

  const summaryData = [
    {
      title: "Total de Alunos",
      value: metrics.total_students.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary-light",
      description: "Alunos matriculados",
    },
    {
      title: "Alunos Ativos",
      value: metrics.active_students.toString(),
      icon: Activity,
      color: "text-success",
      bgColor: "bg-success-light",
      description: `${metrics.participation_rate?.toFixed(1) || 0}% de participação`,
    },
    {
      title: "Interações Totais",
      value: metrics.total_interactions.toLocaleString(),
      icon: MessageSquare,
      color: "text-warning",
      bgColor: "bg-warning-light",
      description: `${metrics.chat_interactions} chat / ${metrics.forum_interactions} fórum`,
    },
    {
      title: "Taxa de Engajamento",
      value: `${metrics.engagement_metrics.participation_rate?.toFixed(1) || 0}%`,
      icon: Target,
      color: "text-info",
      bgColor: "bg-info-light",
      description: "Taxa de alunos ativos",
    },
    {
      title: "Melhor Aluno (Engajamento)",
      value: topStudent,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary-light",
      description: "Aluno com mais interações",
    },
    {
      title: "Tendência",
      value: metrics.performance_metrics.improvement_trend === 'up' ? 'Melhorando' :
             metrics.performance_metrics.improvement_trend === 'down' ? 'Declinando' : 'Estável',
      icon: Clock,
      color: "text-secondary",
      bgColor: "bg-secondary-light",
      description: "Tendência de desempenho geral",
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
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}