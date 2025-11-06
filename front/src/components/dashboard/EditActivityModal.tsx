import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Upload, Link2 } from "lucide-react";
import { pb } from "@/lib/pocketbase";


export function EditActivityModal({ activity, onSave }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(activity || {
    title: "",
    instructions: "",
    points: "",
    dueDate: "",
    topic: "",
    attachment: "",
  });

  const handleEdit = async () => {
    if (!formData.title) {
      alert("O título é obrigatório!");
      return;
    }

    try {
      const updated = await pb.collection("activities").update(activity.id, {
        title: formData.title,
        instructions: formData.instructions,
        points: Number(formData.points) || 0,
        dueDate: formData.dueDate || null,
        topic: formData.topic,
        attachment: formData.attachment || "",
      });

      onSave?.(updated); // envia o registro atualizado para atualizar a tabela
      setOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      alert("Não foi possível salvar as alterações.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Atividade</DialogTitle>
          <DialogDescription>
            Atualize as informações abaixo e clique em <b>Salvar</b> para
            registrar as alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Projeto Arduino com sensores"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Instruções */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              placeholder="Descreva as orientações e critérios de avaliação"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
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
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Entrega</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
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
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
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
            onClick={handleEdit}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
