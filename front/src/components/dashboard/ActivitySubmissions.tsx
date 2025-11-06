import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ActivitySubmissions() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activity, setActivity] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o modal
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const activityRecord = await pb.collection("activities").getOne(activityId);
        const submissionRecords = await pb.collection("submissions").getFullList({
          filter: `activity.id = '${activityId}'`,
          expand: "student",
          sort: "-submittedAt",
        });
        setActivity(activityRecord);
        setSubmissions(submissionRecords);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activityId) loadData();
  }, [activityId]);

  const refreshList = async () => {
    const submissionRecords = await pb.collection("submissions").getFullList({
      filter: `activity.id = '${activityId}'`,
      expand: "student",
      sort: "-submittedAt",
    });
    setSubmissions(submissionRecords);
  };

  const handleAvaliarClick = (sub: any) => {
    setSelectedSubmission(sub);
    setGrade(sub.grade || "");
    setFeedback(sub.feedback || "");
    setOpen(true);
  };

  const handleSalvarAvaliacao = async () => {
    if (!selectedSubmission) return;

    if (!grade || isNaN(Number(grade))) {
      toast({
        title: "Informe uma nota válida",
        description: "Você deve inserir um número válido antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await pb.collection("submissions").update(selectedSubmission.id, {
        grade: parseFloat(grade),
        feedback: feedback || "",
        status: "corrigido", // ✅ Atualiza status
      });

      toast({ title: "Avaliação salva com sucesso!" });
      setOpen(false);
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");
      await refreshList(); // Atualiza tabela
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao salvar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => history.back()}
              variant="ghost"
              size="icon"
              className="hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Entregas \ {activity?.title || "Atividade"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Visualize e avalie as respostas enviadas pelos alunos
              </p>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <Card className="bg-white border shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="w-[180px]">Data de Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? (
                  submissions.map((sub) => {
                    const student = sub.expand?.student;
                    const fileUrl =
                      sub.attachments?.length > 0
                        ? pb.files.getUrl(sub, sub.attachments[0])
                        : null;

                    // Truncar feedback se muito longo
                    const truncatedFeedback =
                      sub.feedback && sub.feedback.length > 40
                        ? sub.feedback.slice(0, 40) + "..."
                        : sub.feedback || "—";

                    return (
                      <TableRow
                        key={sub.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {student?.name || "Aluno"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {student?.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>{formatDate(sub.submittedAt)}</TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sub.status === "corrigido"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {sub.status === "corrigido"
                              ? "Corrigido"
                              : "Enviado"}
                          </span>
                        </TableCell>

                        <TableCell>
                          {sub.grade ? (
                            <div className="flex items-center gap-2">
                              <span>{sub.grade} pts</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAvaliarClick(sub)}
                              >
                                Editar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAvaliarClick(sub)}
                            >
                              Avaliar
                            </Button>
                          )}
                        </TableCell>

                        <TableCell>
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" /> Ver arquivo
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell>
                          {sub.feedback ? (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help text-sm text-slate-800 dark:text-slate-200">
                                    {truncatedFeedback}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm break-words">
                                  {sub.feedback}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Nenhuma entrega encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Avaliação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.grade ? "Editar Avaliação" : "Avaliar Entrega"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Nota</label>
              <Input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Digite a nota"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escreva um comentário para o aluno"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarAvaliacao}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
