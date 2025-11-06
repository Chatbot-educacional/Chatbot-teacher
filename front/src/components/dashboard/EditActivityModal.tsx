// front/src/components/dashboard/EditActivityModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { pb } from "@/lib/pocketbase";

interface EditActivityModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  classId: string;
  activityId: string;
  onUpdated?: () => void;
}

export default function EditActivityModal({
  open,
  setOpen,
  classId,
  activityId,
  onUpdated,
}: EditActivityModalProps) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [score, setScore] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [topic, setTopic] = useState("");

  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    // carregar dados da atividade
    pb.collection("activities")
      .getOne(activityId)
      .then((rec) => {
        setTitle(rec.title || "");
        setInstructions(rec.instructions || "");
        setScore(rec.score?.toString() || "0");
        setDueDate(rec.dueDate || "");
        setTopic(rec.topic || "");
        // suposição: rec.attachments é array com nomes/urls
        if (rec.attachments && Array.isArray(rec.attachments)) {
          setExistingAttachments(
            rec.attachments.map((a: any) =>
              pb.getFileUrl(rec, a)
            )
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar atividade:", err);
      });
  }, [open, activityId]);

  async function handleUpdate() {
    setErrorMessage("");

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("instructions", instructions);
      fd.append("score", score);
      fd.append("dueDate", dueDate);
      fd.append("topic", topic);
      fd.append("classId", classId);

      if (attachments) {
        for (let i = 0; i < attachments.length; i++) {
          fd.append("attachments", attachments[i]);
        }
      }

      await pb.collection("activities").update(activityId, fd);

      setOpen(false);

      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro ao atualizar atividade. Verifique os arquivos enviados.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar atividade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-medium">Título *</p>
            <Input
              placeholder="Ex: Projeto Arduino com sensores"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className="font-medium">Instruções</p>
            <Textarea
              placeholder="Descreva as orientações e critérios de avaliação"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Pontuação</p>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>

            <div>
              <p className="font-medium">Data de entrega</p>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="font-medium">Tópico</p>
            <Input
              placeholder="Ex: Robótica, Lógica, Web, etc."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <p className="font-medium">Anexos (opcional)</p>
            <Input
              type="file"
              multiple
              onChange={(e) => setAttachments(e.target.files)}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
          </div>

          {existingAttachments.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Arquivos existentes:</p>
              <ul className="list-disc pl-5">
                {existingAttachments.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} className="bg-black text-white">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

