import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { extractTextFromPDF } from "@/services/lessonPlan/pdf-service";
import { chunkText } from "@/services/lessonPlan/chunk-service";
import { generateLessonPlan } from "@/services/lessonPlan/rag-service";
import ReactMarkdown from "react-markdown";


export default function GenerateLessonPlan() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [quantidadeAulas, setQuantidadeAulas] = useState("");
    const [duracaoAula, setDuracaoAula] = useState("");
    const [ementa, setEmenta] = useState("");
    const [objetivoGeral, setObjetivoGeral] = useState("");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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
            setResult(null);

            const text = await extractTextFromPDF(file);
            const chunks = chunkText(text);

            const lessonPlan = await generateLessonPlan({
                textChunks: chunks,
                quantidadeAulas: Number(quantidadeAulas),
                duracaoAula: Number(duracaoAula),
                ementa,
                objetivoGeral,
            });
            console.log("RESULTADO:", lessonPlan);
            setResult(lessonPlan);

            toast({
                title: "Plano gerado com sucesso!",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao gerar plano",
                description: "Verifique o arquivo e tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
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
                        <h1 className="text-3xl font-bold">
                            Gerador de Plano de Aula
                        </h1>
                        <p className="text-muted-foreground">
                            Gere planos estruturados com base no seu material
                        </p>
                    </div>
                </div>

                {/* CONFIGURAÇÃO */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold">
                            Configuração do Curso
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Quantidade de Aulas *
                                </label>
                                <Input
                                    type="number"
                                    value={quantidadeAulas}
                                    onChange={(e) => setQuantidadeAulas(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Duração de cada aula (min) *
                                </label>
                                <Input
                                    type="number"
                                    value={duracaoAula}
                                    onChange={(e) => setDuracaoAula(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Ementa *
                            </label>
                            <Textarea
                                value={ementa}
                                onChange={(e) => setEmenta(e.target.value)}
                                placeholder="Descreva os tópicos e conteúdos que serão abordados"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Objetivo Geral
                            </label>
                            <Textarea
                                value={objetivoGeral}
                                onChange={(e) => setObjetivoGeral(e.target.value)}
                                placeholder="Descreva o objetivo do curso"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* UPLOAD */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold">
                            Material Base
                        </h2>

                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) =>
                                    setFile(e.target.files ? e.target.files[0] : null)
                                }
                            />
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>

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

                {/* RESULTADO */}
                {result && (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold">
                                Plano Gerado
                            </h2>

                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}