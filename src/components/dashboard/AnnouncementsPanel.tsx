import { useState } from "react";
import { Megaphone, Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: "baixa" | "média" | "alta";
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Prova de Java - Próxima Semana",
    content: "A prova de Java será na próxima quinta-feira, dia 15/02. Estudem os tópicos: POO, herança e polimorfismo.",
    date: "2024-02-08",
    priority: "alta"
  },
  {
    id: 2,
    title: "Material Extra Disponível",
    content: "Adicionei exercícios extras de ponteiros na plataforma. Pratiquem bastante!",
    date: "2024-02-07",
    priority: "média"
  },
  {
    id: 3,
    title: "Horário de Monitoria",
    content: "Lembrete: monitoria acontece todas as terças, 14h-16h, sala 203.",
    date: "2024-02-05",
    priority: "baixa"
  }
];

export function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"baixa" | "média" | "alta">("média");

  const handleCreateAnnouncement = () => {
    if (newTitle.trim() && newContent.trim()) {
      const announcement: Announcement = {
        id: announcements.length + 1,
        title: newTitle,
        content: newContent,
        date: new Date().toISOString().split('T')[0],
        priority: newPriority
      };
      setAnnouncements([announcement, ...announcements]);
      setNewTitle("");
      setNewContent("");
      setNewPriority("média");
      setIsCreating(false);
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "destructive";
      case "média": return "secondary";
      case "baixa": return "outline";
      default: return "secondary";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Anúncios para a Turma
          </CardTitle>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            size="sm"
            variant={isCreating ? "outline" : "default"}
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Cancelar" : "Novo Anúncio"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Create New Announcement Form */}
        {isCreating && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <Input
              placeholder="Título do anúncio..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Conteúdo do anúncio..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Prioridade:</span>
              <div className="flex gap-2">
                {(["baixa", "média", "alta"] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={newPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewPriority(priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateAnnouncement} size="sm">
                Publicar Anúncio
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Announcements List */}
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <Badge variant={getPriorityColor(announcement.priority) as any}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(announcement.date)}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}