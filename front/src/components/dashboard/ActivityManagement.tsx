import {
  ArrowLeft,
  Edit,
  Eye,
  Link2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditActivityModal } from "./EditActivityModal";
import { createActivityPB } from "@/services/activity-services";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
import { useParams } from "react-router-dom";
import { pb } from "@/lib/pocketbase";

export function ActivityManagement() {
  const navigate = useNavigate();
  const { classId } = useParams();

  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState({
    title: "",
    instructions: "",
    points: "",
    dueDate: "",
    topic: "",
    attachment: "",
  });
  const [activities, setActivities] = useState([]);

  // Função para carregar atividades do PocketBase
  const loadActivities = async () => {
    try {
      const records = await pb.collection("activities").getFullList({
        filter: `class.id='${classId}'`,
        expand: "class",
        sort: "-created", // mais recentes primeiro
      });

      const formatted = records.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.instructions,
        status: r.status || "em andamento",
        submittedCount: r.submittedCount || 0,
        totalStudents: r.totalStudents || 0,
        createdAt: r.created,
        dueDate: r.dueDate,
      }));

      setActivities(formatted);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    }
  };

  // Carregar atividades ao montar o componente ou quando classId mudar
  useEffect(() => {
    if (classId) {
      loadActivities();
    }
  }, [classId]);

  // handleCreate permanece igual
  const handleCreate = async () => {
    if (!activity.title) {
      alert("O título é obrigatório!");
      return;
    }

    try {
      const newAct = await createActivityPB({
        ...activity,
        classId,
      });

      setActivities((prev) => [
        ...prev,
        {
          id: newAct.id,
          title: newAct.title,
          description: newAct.instructions,
          status: newAct.status || "em andamento",
          submittedCount: newAct.submittedCount || 0,
          totalStudents: newAct.totalStudents || 0,
          createdAt: newAct.created,
          dueDate: newAct.dueDate,
        },
      ]);

      setActivity({
        title: "",
        instructions: "",
        points: "",
        dueDate: "",
        topic: "",
        attachment: "",
      });

      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      alert("Não foi possível criar a atividade.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/classes")}
              variant="ghost"
              size="icon"
              className="hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
              <p className="mt-2 text-muted-foreground">
                Acompanhe as atividades dos seus alunos
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Nova Atividade
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar nova atividade</DialogTitle>
                <DialogDescription>
                  Preencha as informações abaixo para adicionar uma atividade à
                  turma.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Projeto Arduino com sensores"
                    value={activity.title}
                    onChange={(e) =>
                      setActivity({ ...activity, title: e.target.value })
                    }
                  />
                </div>

                {/* Instruções */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instruções</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Descreva as orientações e critérios de avaliação"
                    value={activity.instructions}
                    onChange={(e) =>
                      setActivity({
                        ...activity,
                        instructions: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                {/* Pontuação e Data de Entrega */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="points">Pontuação</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="100"
                      value={activity.points}
                      onChange={(e) =>
                        setActivity({ ...activity, points: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Entrega</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={activity.dueDate}
                      onChange={(e) =>
                        setActivity({ ...activity, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Tópico */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Tópico</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Robótica, Lógica, Web, etc."
                    value={activity.topic}
                    onChange={(e) =>
                      setActivity({ ...activity, topic: e.target.value })
                    }
                  />
                </div>

                {/* Anexos */}
                <div className="space-y-2">
                  <Label>Anexos (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" /> Arquivo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Link2 className="h-4 w-4" /> Link
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={handleCreate}
                >
                  Criar Atividade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="bg-white border shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[160px]">Entregas</TableHead>
                  <TableHead className="w-[160px]">Criada em</TableHead>
                  <TableHead className="w-[160px]">Data de Entrega</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{activity.title}</span>
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                          {activity.description || "Sem descrição"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === "terminada"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {activity.status === "terminada"
                          ? "Terminada"
                          : "Em andamento"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {activity.submittedCount}/{activity.totalStudents}
                    </TableCell>

                    <TableCell>{formatDate(activity.createdAt)}</TableCell>
                    <TableCell>
                      {activity.dueDate ? formatDate(activity.dueDate) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewActivity(activity.id)}
                              aria-label="Visualizar atividade"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <EditActivityModal
                              activity={activity}
                              onSave={(updated) => {
                                console.log("Nova atividade editada:", updated);
                                // Atualiza lista:
                                // setActivities(prev => prev.map(a => a.id === updated.id ? updated : a))
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteActivity(activity.id)}
                              aria-label="Excluir atividade"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
