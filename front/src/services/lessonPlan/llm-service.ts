import OpenAI from "openai";
import { LessonPlan } from "@/types/lesson-plan";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

interface LLMParams {
    quantidadeAulas: number;
    duracaoAula: number;
    nivelEnsino: string;
    objetivoGeral?: string;
    contextChunks: string[];
}

export async function generateLessonPlan({
    quantidadeAulas,
    duracaoAula,
    nivelEnsino,
    objetivoGeral,
    contextChunks,
}: LLMParams): Promise<LessonPlan> {
    const context = contextChunks.join("\n\n");

    const prompt = `
Você é um especialista em didática.

Baseie-se EXCLUSIVAMENTE no material fornecido abaixo.
Não invente conteúdos.
Distribua proporcionalmente o conteúdo em ${quantidadeAulas} aulas.
Cada aula deve ter ${duracaoAula} minutos.
Nível de ensino: ${nivelEnsino}
Objetivo geral do curso: ${objetivoGeral || "Não informado"}

Material:
${context}

Retorne APENAS o seguinte JSON válido:

{
  "curso": "",
  "nivel": "",
  "carga_total": "",
  "planos_de_aula": [
    {
      "aula": 1,
      "tema": "",
      "duracao": "",
      "objetivos": [],
      "conteudo_programatico": [],
      "estrategias": [],
      "recursos": [],
      "avaliacao": ""
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
    });

    const text = response.choices[0].message.content;

    if (!text) throw new Error("Resposta vazia da OpenAI");

    return JSON.parse(text);
}