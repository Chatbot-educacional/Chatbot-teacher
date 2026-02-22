import { generateWithOllama } from "../ollama-service";

export async function generateLessonPlan(params) {

  const duracao = params.duracaoAula
    ? `${params.duracaoAula} minutos`
    : "Não definida";

  const objetivo = params.objetivoGeral?.trim()
    ? params.objetivoGeral
    : "Não informado";

  const prompt = `
Gere um plano de aula em formato Markdown estruturado.

# Plano de Aula

**Quantidade de aulas:** ${params.quantidadeAulas}  
**Duração de cada aula:** ${duracao}  
**Ementa:** ${params.ementa}  
**Objetivo geral:** ${objetivo}

---

Estruture assim:

## Aula 1
### Objetivos
### Conteúdo
### Metodologia
### Avaliação
`;

  const response = await generateWithOllama({
    prompt,
    stream: false
  });

  return response;
}