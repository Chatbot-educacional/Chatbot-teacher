import { generateWithOllama } from "../ollama-service";

export async function generateLessonPlan(params) {
    const prompt = `
 Responda em formato Markdown estruturado usando:
 
  Quantidade de aulas: ${params.quantidadeAulas}
  Duração: ${params.duracao} minutos
  Ementa: ${params.ementa}
  Objetivo geral: ${params.objetivo}

  Estruture em:
  - Aula 1
  - Objetivos
  - Conteúdo
  - Metodologia
  - Avaliação
  `;

    return await generateWithOllama(prompt);
}