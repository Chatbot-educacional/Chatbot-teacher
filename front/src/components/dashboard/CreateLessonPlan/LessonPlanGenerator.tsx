import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

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

export default function GenerateLessonPlan() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { classId } = useParams<{ classId: string }>();

    const [file, setFile] = useState<File | null>(null);
    const [discipline, setDiscipline] = useState("");
    const [course, setCourse] = useState("");
    const [workload, setWorkload] = useState("");
    const [quantidadeAulas, setQuantidadeAulas] = useState("");
    const [duracaoAula, setDuracaoAula] = useState("");
    const [ementa, setEmenta] = useState("");
    const [objetivoGeral, setObjetivoGeral] = useState("");

    const [generatedLessons, setGeneratedLessons] = useState<any[]>([]);
    const [lessonStatus, setLessonStatus] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);

    /*
    =========================
    CARREGAR AULAS DO BANCO
    =========================
    */

    useEffect(() => {
        const loadLessonPlan = async () => {
            if (!classId) return;

            try {
                const response = await getLessonPlanByClass(classId);

                console.log("LESSONS FROM PB:", response);

                if (!response) return;

                const lessons = Array.isArray(response) ? response : [response];

                setGeneratedLessons(lessons);
            } catch (err) {
                toast({
                    title: "Erro ao carregar plano de aula",
                    variant: "destructive",
                });
            }
        };

        loadLessonPlan();
    }, [classId, toast]);

    /*
    =========================
    GERAR PLANO COM IA
    =========================
    */

    const handleGenerate = async () => {
        if (!file || !discipline || !course || !workload || !quantidadeAulas) {
            toast({
                title: "Preencha todos os campos obrigatórios",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const text = await extractTextFromPDF(file);
            const chunks = chunkText(text);

            const generated: any[] = [];

            for (let i = 1; i <= Number(quantidadeAulas); i++) {
                const aiPlan = await generateLessonPlan({
                    discipline,
                    course,
                    workload: Number(workload),
                    totalLessons: Number(quantidadeAulas),
                    lessonDuration: Number(duracaoAula),
                    syllabus: ementa,
                    generalObjective: objetivoGeral,
                    textChunks: chunks,
                });

                generated.push({
                    ...aiPlan,
                    lessonOrder: i,
                });
            }

            setGeneratedLessons(generated);
            setLessonStatus(new Array(generated.length).fill("pending"));

            setCurrentLessonIndex(0);
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

    /*
    =========================
    CONFIRMAR AULA
    =========================
    */

    const handleConfirmLesson = (index: number) => {
        const status = [...lessonStatus];
        status[index] = "approved";
        setLessonStatus(status);

        setShowModal(false);
    };

    /*
    =========================
    SALVAR AULAS
    =========================
    */

    const handleSaveLessons = async () => {
        try {
            setLoading(true);

            for (const lesson of generatedLessons) {
                await saveLessonPlan({
                    class_id: classId,
                    discipline,
                    course,
                    workload: Number(workload),
                    totalLessons: Number(quantidadeAulas),
                    lessonDuration: Number(duracaoAula),

                    syllabus: lesson.syllabus,
                    general_objective: lesson.general_objective,
                    specific_objectives: lesson.specific_objectives,
                    methodology: lesson.methodology,
                    assessment: lesson.assessment,
                    basic_references: lesson.basic_references,
                    complementary_references: lesson.complementary_references,

                    lessonOrder: lesson.lessonOrder,
                    status: "approved",
                });
            }

            toast({
                title: "Aulas salvas com sucesso!",
            });
        } catch (error) {
            toast({
                title: "Erro ao salvar as aulas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    /*
    =========================
    RENDER
    =========================
    */

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto p-8 space-y-8">

                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <h1 className="text-3xl font-semibold">Plano de Ensino</h1>
                </div>

                {/* FORM */}

                <Card className="p-6">
                    <CardContent className="space-y-4">

                        <Input
                            placeholder="Disciplina"
                            value={discipline}
                            onChange={(e) => setDiscipline(e.target.value)}
                        />

                        <Input
                            placeholder="Curso"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Carga Horária"
                            value={workload}
                            onChange={(e) => setWorkload(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Quantidade de Aulas"
                            value={quantidadeAulas}
                            onChange={(e) => setQuantidadeAulas(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Duração da Aula (min)"
                            value={duracaoAula}
                            onChange={(e) => setDuracaoAula(e.target.value)}
                        />

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

                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                setFile(e.target.files ? e.target.files[0] : null)
                            }
                        />

                        <Button onClick={handleGenerate} disabled={loading}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {loading ? "Gerando..." : "Gerar Plano de Aula"}
                        </Button>

                    </CardContent>
                </Card>

                {/* LISTA */}

                {generatedLessons.length > 0 ? (
                    <Card className="p-6">
                        <CardContent>

                            <h2 className="text-xl font-semibold mb-4">
                                Aulas Geradas
                            </h2>

                            <ul className="space-y-4">
                                {generatedLessons.map((lesson, index) => (
                                    <li
                                        key={lesson.id || index}
                                        className="flex justify-between items-center"
                                    >
                                        <strong>
                                            Aula {lesson.lessonOrder || index + 1}
                                        </strong>

                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setCurrentLessonIndex(index);
                                                setShowModal(true);
                                            }}
                                        >
                                            Revisar
                                        </Button>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                                onClick={handleSaveLessons}
                            >
                                Salvar Aulas
                            </Button>

                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center text-gray-500">
                        Nenhuma aula gerada ainda.
                    </div>
                )}

            </div>

            {/* MODAL */}

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-4xl">

                    <DialogHeader>
                        <DialogTitle>Revisar Aula</DialogTitle>
                    </DialogHeader>

                    {currentLessonIndex !== null && (
                        <Textarea
                            className="min-h-[400px] font-mono"
                            value={JSON.stringify(
                                generatedLessons[currentLessonIndex],
                                null,
                                2
                            )}
                            onChange={(e) => {
                                const updated = [...generatedLessons];
                                updated[currentLessonIndex] = JSON.parse(e.target.value);
                                setGeneratedLessons(updated);
                            }}
                        />
                    )}

                    <DialogFooter>
                        <Button
                            onClick={() =>
                                handleConfirmLesson(currentLessonIndex ?? 0)
                            }
                        >
                            Confirmar Aula
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </div>
    );
}