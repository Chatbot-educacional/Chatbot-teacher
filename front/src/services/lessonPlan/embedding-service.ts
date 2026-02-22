import { generateWithOllama } from "../ollama-service";

export async function generateLessonPlan(params) {
    const prompt = `
Gere um plano de aula em formato Markdown estruturado.

Quantidade de aulas: ${params.quantidadeAulas}
Duração de cada aula: ${params.duracaoAula} minutos
Ementa: ${params.ementa}
${params.objetivoGeral ? `Objetivo geral: ${params.objetivoGeral}` : ""}

⚠️ Nunca escreva a palavra "undefined".
Se alguma informação não for fornecida, apenas omita.

Estruture exatamente assim:

# Plano de Aula

## Aula 1
### Objetivos
### Conteúdo
### Metodologia
### Avaliação
`;

    return await generateWithOllama(prompt);
}