// services/lessonPlan/rag-service.ts
import { generateWithOllama } from "../ollama-service";

interface GenerateLessonPlanParams {
  discipline: string;
  course: string;
  workload: number;
  totalLessons: number;
  lessonDuration: number;
  syllabus?: string;
  generalObjective?: string;
  textChunks?: string[];
}

export async function generateLessonPlan(params: GenerateLessonPlanParams) {
  const prompt = `
    Você é especialista em planejamento pedagógico universitário.

    Gere um plano de aula único em formato JSON.

    ⚠️ Retorne APENAS JSON válido.
    ⚠️ Não use markdown.
    ⚠️ Não explique nada.
    ⚠️ Nunca retorne undefined.

    Formato EXATO:

    {
      "syllabus": string,
      "general_objective": string,
      "specific_objectives": string[],
      "methodology": string,
      "assessment": string,
      "basic_references": string[],
      "complementary_references": string[]
    }

    Dados:
    Disciplina: ${params.discipline}
    Curso: ${params.course}
    Carga horária: ${params.workload}
    Duração da aula: ${params.lessonDuration}
    Ordem da aula: ${params.totalLessons}
    Ementa base: ${params.syllabus}
    Objetivo geral base: ${params.generalObjective}
  `;

  const response = await generateWithOllama(prompt);

  if (!response || response.trim().length === 0) {
    throw new Error("IA retornou vazio.");
  }

  let cleaned = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extrair apenas o JSON entre {}
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("IA retornou JSON inválido ou incompleto.");
  }
}