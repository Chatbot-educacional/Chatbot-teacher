import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { extractTextFromPDF } from "@/services/lessonPlan/pdf-service";
import { chunkText } from "@/services/lessonPlan/chunk-service";
import { generateLessonPlan } from "@/services/lessonPlan/rag-service";
import { saveLessonPlan } from "@/services/lessonPlan/saveLessonPlan";
import { getLessonPlanByClass } from "@/services/lessonPlan/getLessonPlan";

import { generateLessons } from "@/services/lessonPlan/lesson-stream-service";


export default function GenerateLessonPlan() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { classId } = useParams<{ classId: string }>();

    const [file, setFile] = useState<File | null>(null);
    const [quantidadeAulas, setQuantidadeAulas] = useState("");
    const [duracaoAula, setDuracaoAula] = useState("");
    const [ementa, setEmenta] = useState("");
    const [objetivoGeral, setObjetivoGeral] = useState("");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const [editablePlan, setEditablePlan] = useState<any>(null);
    const [existingPlanId, setExistingPlanId] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [creatingLessons, setCreatingLessons] = useState(false);

    // 🔥 Carregar plano existente
    useEffect(() => {
        const loadPlan = async () => {
            if (!classId) return;

            try {
                const plan = await getLessonPlanByClass(classId);

                if (plan) {
                    setExistingPlanId(plan.id);
                    setResult(plan.content);
                    setEditablePlan(plan.content);

                    setQuantidadeAulas(String(plan.totalLessons || ""));
                    setDuracaoAula(String(plan.lessonDuration || ""));
                    setEmenta(plan.syllabus || "");
                    setObjetivoGeral(plan.generalObjective || "");
                }
            } catch (error) {
                console.error("Erro ao carregar plano:", error);
            }
        };

        loadPlan();
    }, [classId]);

    // 🔥 Gerar plano com IA
    const handleGenerate = async () => {
        if (!file || !quantidadeAulas || !duracaoAula || !ementa) {
            toast({
                title: "Preencha todos os campos obrigatórios",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            const text = await extractTextFromPDF(file);
            const chunks = chunkText(text);

            const lessonPlan = await generateLessonPlan({
                textChunks: chunks,
                quantidadeAulas: Number(quantidadeAulas),
                duracaoAula: Number(duracaoAula),
                ementa,
                objetivoGeral,
            });

            setEditablePlan(lessonPlan);
            setShowModal(true);
        } catch (err) {
            toast({
                title: "Erro ao gerar plano",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Salvar (create ou update)

    const handleSave = async () => {
        try {
            if (!classId) return;

            setCreatingLessons(true);

            toast({
                title: "Criando aulas e atividades...",
                description: "Isso pode levar alguns segundos.",
            });

            const record = await saveLessonPlan({
                id: existingPlanId,
                title: "Plano de Ensino",
                content: editablePlan,
                totalLessons: Number(quantidadeAulas),
                lessonDuration: Number(duracaoAula),
                syllabus: ementa,
                generalObjective: objetivoGeral,
                status: "approved",
                classId,
            });

            await generateLessons({
                totalLessons: Number(quantidadeAulas),
                syllabus: ementa,
                lessonPlanId: record.id,
                classId
            });

            toast({
                title: "Plano, aulas e atividades criados com sucesso!",
            });

            setExistingPlanId(record.id);
            setResult(editablePlan);
            setShowModal(false);

        } catch (error) {
            toast({
                title: "Erro ao criar aulas",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setCreatingLessons(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
            <div className="container mx-auto p-6 space-y-6">

                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <h1 className="text-3xl font-bold">Plano de Ensino</h1>
                        <p className="text-muted-foreground">
                            Crie e gerencie o plano da turma
                        </p>
                    </div>
                </div>

                {/* VISUALIZAÇÃO */}
                {result ? (
                    <Card>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Plano Atual</h2>

                                <Button onClick={() => setShowModal(true)}>
                                    Editar Plano
                                </Button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border whitespace-pre-wrap">
                                {result}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* CONFIGURAÇÃO */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Configuração</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        placeholder="Quantidade de aulas"
                                        value={quantidadeAulas}
                                        onChange={(e) => setQuantidadeAulas(e.target.value)}
                                    />

                                    <Input
                                        type="number"
                                        placeholder="Duração (min)"
                                        value={duracaoAula}
                                        onChange={(e) => setDuracaoAula(e.target.value)}
                                    />
                                </div>

                                <Textarea
                                    placeholder="Ementa"
                                    value={ementa}
                                    onChange={(e) => setEmenta(e.target.value)}
                                />

                                <Textarea
                                    placeholder="Objetivo Geral"
                                    value={objetivoGeral}
                                    onChange={(e) => setObjetivoGeral(e.target.value)}
                                />
                            </CardContent>
                        </Card>

                        {/* UPLOAD */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) =>
                                        setFile(e.target.files ? e.target.files[0] : null)
                                    }
                                />

                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {loading ? "Gerando..." : "Gerar Plano"}
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* MODAL DE EDIÇÃO COMPLETA */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-4xl space-y-4">
                    <DialogHeader>
                        <DialogTitle>Editar Plano de Ensino</DialogTitle>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            type="number"
                            value={quantidadeAulas}
                            onChange={(e) => setQuantidadeAulas(e.target.value)}
                            placeholder="Quantidade de aulas"
                        />

                        <Input
                            type="number"
                            value={duracaoAula}
                            onChange={(e) => setDuracaoAula(e.target.value)}
                            placeholder="Duração (min)"
                        />
                    </div>

                    <Textarea
                        value={ementa}
                        onChange={(e) => setEmenta(e.target.value)}
                        placeholder="Ementa"
                    />

                    <Textarea
                        value={objetivoGeral}
                        onChange={(e) => setObjetivoGeral(e.target.value)}
                        placeholder="Objetivo Geral"
                    />

                    <Textarea
                        value={editablePlan}
                        onChange={(e) => setEditablePlan(e.target.value)}
                        className="min-h-[300px] font-mono"
                    />
                    {editablePlan?.lessons?.map((lesson, index) => (
                        <div key={index} className="border rounded p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-semibold">Aula {lesson.order}</h3>

                            <Textarea
                                value={lesson.objectives.join("\n")}
                                onChange={(e) => {
                                    const updated = { ...editablePlan }
                                    updated.lessons[index].objectives = e.target.value.split("\n")
                                    setEditablePlan(updated)
                                }}
                                placeholder="Objetivos (1 por linha)"
                            />

                            <Textarea
                                value={lesson.contents.join("\n")}
                                onChange={(e) => {
                                    const updated = { ...editablePlan }
                                    updated.lessons[index].contents = e.target.value.split("\n")
                                    setEditablePlan(updated)
                                }}
                                placeholder="Conteúdo (1 por linha)"
                            />
                        </div>
                    ))}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={creatingLessons}>
                            {creatingLessons ? "Criando aulas..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}