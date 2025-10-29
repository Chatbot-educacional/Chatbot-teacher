import { Users, MessageSquare, Clock, Star, BookOpen, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// O tipo de dados deve ser o que é retornado por getStudentAnalytics
interface StudentSummaryData {
  totalInteractions: number;
  forumInteractions: number;
  chatInteractions: number;
  subjects: string[];
  lastActivity: string;
  engagementScore: number;
}

interface SummaryCardsAlunosProps {
  data: StudentSummaryData;
}

export function SummaryCardsAlunos({ data }: SummaryCardsAlunosProps) {
  const {
    totalInteractions,
    forumInteractions,
    chatInteractions,
    subjects,
    lastActivity,
    engagementScore,
  } = data;

  const summaryData = [
    {
      title: "Interações Totais",
      value: totalInteractions.toString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Interações no fórum e chat",
    },
    {
      title: "Score de Engajamento",
      value: `${engagementScore}%`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Pontuação baseada na atividade",
    },
    {
      title: "Interações no Chatbot",
      value: chatInteractions.toString(),
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Perguntas e respostas com o bot",
    },
    {
      title: "Interações no Fórum",
      value: forumInteractions.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Atividades de perguntas e respostas",
    },
    {
      title: "Última Atividade",
      value: new Date(lastActivity).toLocaleDateString(),
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Data da última interação registrada",
    },
    {
      title: "Assuntos Abordados",
      value: subjects.length.toString(),
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: subjects.join(", ") || "Nenhum assunto registrado",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
