import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users, BookOpen, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/pocketbase";
import { DashboardHeader } from "../dashboard/DashboardHeader";

interface ClassRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  totalStudents?: number;
  created: string;
  updated: string;
}

export function ClassManagement() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const records = await pb.collection('classes').getFullList<ClassRecord>({
        sort: '-created',
      });
      setClasses(records);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (classItem?: ClassRecord) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        name: classItem.name,
        code: classItem.code,
        description: classItem.description || "",
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: "",
        code: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClass(null);
    setFormData({
      name: "",
      code: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClass) {
        // Atualizar turma existente
        await pb.collection('classes').update(editingClass.id, formData);
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        });
      } else {
        // Criar nova turma
        await pb.collection('classes').create(formData);
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }
      
      handleCloseDialog();
      loadClasses();
    } catch (error: any) {
      console.error('Erro ao salvar turma:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a turma.",
        variant: "destructive",
      });
    }
  };

  const handleOpenMembersDialog = async (classItem: ClassRecord) => {
    setSelectedClass(classItem);
    setIsMembersDialogOpen(true);
    
    try {
      const membersList = await pb.collection('class_members').getFullList({
        filter: `class = "${classItem.id}"`,
        expand: 'user',
      });
      
      // Mapear para extrair o registro do usuário e adicionar a URL do avatar
      const processedMembers = membersList.map((member: any) => {
        const userRecord = member.expand?.user;
        if (userRecord) {
          return {
            ...userRecord,
            role: member.role,
            avatarUrl: getAvatarUrl(userRecord, '80x80'),
          };
        }
        return null;
      }).filter(Boolean);

      setMembers(processedMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da turma.",
        variant: "destructive",
      });
      setMembers([]);
    }
  };

  const handleCloseMembersDialog = () => {
    setIsMembersDialogOpen(false);
    setSelectedClass(null);
    setMembers([]);
  };

  const handleDelete = async (classItem: ClassRecord) => {
    if (!confirm(`Tem certeza que deseja excluir a turma "${classItem.name}"?`)) {
      return;
    }

    try {
      await pb.collection('classes').delete(classItem.id);
      toast({
        title: "Sucesso",
        description: "Turma excluída com sucesso!",
      });
      loadClasses();
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a turma.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="sticky top-0 z-40">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Gerenciamento de Turmas
                </CardTitle>
                <CardDescription>
                  Crie e gerencie turmas para organizar seus alunos
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Turma
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando turmas...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Nenhuma turma cadastrada</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Nova Turma" para começar
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">
                      <Users className="h-4 w-4 inline mr-1" />
                      Alunos
                    </TableHead>
                    <TableHead>
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Criada em
                    </TableHead>
                    <TableHead className="text-center">Membros</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>
                        <Badge variant="outline">{classItem.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{classItem.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {classItem.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {classItem.totalStudents || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(classItem.created)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenMembersDialog(classItem)}
                          title="Ver Membros"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(classItem)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(classItem)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para criar/editar turma */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Editar Turma" : "Nova Turma"}
              </DialogTitle>
              <DialogDescription>
                {editingClass
                  ? "Atualize as informações da turma"
                  : "Preencha os dados para criar uma nova turma"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Turma *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Turma A - Manhã"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  placeholder="Ex: TMA"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Turma do período matutino"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingClass ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para listar membros */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Membros da Turma: {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Lista de alunos e professores na turma.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum membro encontrado.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'teacher' ? 'default' : 'secondary'} className="capitalize">
                      {member.role === 'teacher' ? 'Professor' : 'Aluno'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseMembersDialog}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
