import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link2 } from "lucide-react";
import { pb } from "@/lib/pocketbase";

export function EditActivityModal({ open, onOpenChange, activity, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    points: "",
    dueDate: "",
    topic: "",
    attachment: "",
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        instructions: activity.description || "",
        points: activity.points || "",
        dueDate: activity.dueDate ? activity.dueDate.split("T")[0] : "",
        topic: activity.topic || "",
        attachment: activity.attachment || "",
      });
    }
  }, [activity]);

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
        dueDate: formData.dueDate || null, // já em formato ISO
        topic: formData.topic,
        attachment: formData.attachment || "",
      });

      onSave?.(updated); // recarrega lista
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      alert("Não foi possível salvar as alterações.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Atividade</DialogTitle>
          <DialogDescription>
            Atualize as informações abaixo e clique em <b>Salvar</b> para
            registrar as alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Pontuação</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data e Hora de Entrega</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value
                    ? new Date(e.target.value).toISOString()
                    : "";
                  setFormData({ ...formData, dueDate: value });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Tópico</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
            />
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
