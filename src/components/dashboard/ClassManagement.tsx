import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Plus, Users, Edit, Trash2, Eye, UserPlus, Loader2, RefreshCw, Search, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  createClass, 
  listTeachingClasses, 
  updateClass, 
  deleteClass, 
  listClassMembers, 
  addClassMember, 
  removeClassMember,
  searchUsers,
  ClassRecord,
  UserRecord
} from "@/lib/pocketbase";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface ClassWithMembers extends ClassRecord {
  memberCount?: number;
}

export function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  
  const [newClass, setNewClass] = useState({ title: "", description: "" });
  const [editClass, setEditClass] = useState<ClassWithMembers | null>(null);
  const [deleteClass_selected, setDeleteClass_selected] = useState<ClassWithMembers | null>(null);
  const [selectedClassForMembers, setSelectedClassForMembers] = useState<ClassWithMembers | null>(null);
  
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserRecord[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await listTeachingClasses();
      
      // Carregar contagem de membros para cada turma
      const classesWithCounts = await Promise.all(
        data.map(async (classItem) => {
          const members = await listClassMembers(classItem.id);
          return {
            ...classItem,
            memberCount: members.length,
          };
        })
      );
      
      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error("Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.title.trim()) {
      toast.warning("Por favor, informe o nome da turma");
      return;
    }

    try {
      await createClass(newClass.title, newClass.description);
      toast.success("Turma criada com sucesso!");
      setNewClass({ title: "", description: "" });
      setCreateOpen(false);
      await loadClasses();
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      toast.error(error.message || "Erro ao criar turma");
    }
  };

  const handleUpdateClass = async () => {
    if (!editClass) return;

    try {
      await updateClass(editClass.id, {
        title: editClass.title,
        description: editClass.description,
      });
      toast.success("Turma atualizada com sucesso!");
      setEditOpen(false);
      setEditClass(null);
      await loadClasses();
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.error("Erro ao atualizar turma");
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClass_selected) return;

    try {
      await deleteClass(deleteClass_selected.id);
      toast.success("Turma excluída com sucesso!");
      setDeleteOpen(false);
      setDeleteClass_selected(null);
      await loadClasses();
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast.error("Erro ao excluir turma");
    }
  };

  const openEditDialog = (classItem: ClassWithMembers) => {
    setEditClass(classItem);
    setEditOpen(true);
  };

  const openDeleteDialog = (classItem: ClassWithMembers) => {
    setDeleteClass_selected(classItem);
    setDeleteOpen(true);
  };

  const openMembersDialog = async (classItem: ClassWithMembers) => {
    setSelectedClassForMembers(classItem);
    setMembersOpen(true);
    setLoadingMembers(true);
    
    try {
      const membersData = await listClassMembers(classItem.id);
      setMembers(membersData);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error("Erro ao carregar membros");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error("Erro ao buscar usuários");
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedClassForMembers) return;

    try {
      await addClassMember(selectedClassForMembers.id, userId, 'student');
      toast.success("Membro adicionado com sucesso!");
      setSearchQuery("");
      setSearchResults([]);
      
      // Recarregar membros
      const membersData = await listClassMembers(selectedClassForMembers.id);
      setMembers(membersData);
      await loadClasses();
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeClassMember(memberId);
      toast.success("Membro removido com sucesso!");
      
      // Recarregar membros
      if (selectedClassForMembers) {
        const membersData = await listClassMembers(selectedClassForMembers.id);
        setMembers(membersData);
        await loadClasses();
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error("Erro ao remover membro");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Turmas</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie suas turmas, alunos e organize suas aulas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadClasses} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar uma nova turma
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nome da Turma *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Programação 2024"
                      value={newClass.title}
                      onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição da turma (opcional)"
                      value={newClass.description}
                      onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateClass}>
                    Criar Turma
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <School className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma turma encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando sua primeira turma
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{classItem.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {classItem.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <School className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{classItem.memberCount || 0} membros</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openMembersDialog(classItem)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Membros
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(classItem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(classItem)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Turma</DialogTitle>
              <DialogDescription>
                Atualize os dados da turma
              </DialogDescription>
            </DialogHeader>
            {editClass && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Nome da Turma</Label>
                  <Input
                    id="edit-title"
                    value={editClass.title}
                    onChange={(e) => setEditClass({ ...editClass, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editClass.description || ""}
                    onChange={(e) => setEditClass({ ...editClass, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateClass}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                Tem certeza que deseja excluir a turma{" "}
                <span className="font-semibold">{deleteClass_selected?.title}</span>?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteClass}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Dialog */}
        <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Membros - {selectedClassForMembers?.title}
              </DialogTitle>
              <DialogDescription>
                Gerencie os membros desta turma
              </DialogDescription>
            </DialogHeader>
            
            {/* Search Users */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Adicionar Membro</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                  />
                  <Button onClick={handleSearchUsers} disabled={searching}>
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddMember(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <Label>Membros Atuais</Label>
                {loadingMembers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum membro encontrado
                  </p>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Papel</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.expand?.user?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {member.expand?.user?.email || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={member.role === 'teacher' ? 'default' : 'secondary'}>
                                {member.role === 'teacher' ? 'Professor' : 'Aluno'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {member.role !== 'teacher' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

