import type { GeneratedPlan, LessonActivity } from "@/pages/lesson/types/lessonPlan";

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://127.0.0.1:11434";

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3:8b",
      prompt,
      stream: false,
      format: "json",   // ⭐ força saída JSON
      options: {
        temperature: 0.3,
        num_predict: 4096
      }
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const data = await res.json();
  return data.response;
}

function extractJSON<T>(raw: string): T {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Nenhum JSON encontrado na resposta da IA");
  }
  const jsonStr = raw.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error("JSON inválido retornado pela IA. Tente novamente.");
  }
}

export async function generateLessonPlan(params: {
  discipline: string;
  course: string;
  workload: string;
  totalLessons: number;
  lessonDuration: string;
  ementa: string;
  objetivoGeral: string;
  fileContent?: string;
}): Promise<GeneratedPlan> {
  const prompt = `Você é um assistente pedagógico especializado em criar planos de aula universitários.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS um JSON válido, sem markdown, sem texto explicativo, sem comentários.
- A quantidade de aulas (lessons) DEVE ser EXATAMENTE ${params.totalLessons}.
- Todos os campos devem estar preenchidos, nunca use undefined ou null.
- Substitua todos os placeholders <...> por conteúdo real
- Cada aula deve ter lesson_order sequencial começando em 1.

DADOS DO PLANO:
- Disciplina: ${params.discipline}
- Curso: ${params.course}
- Carga Horária: ${params.workload}
- Quantidade de Aulas: ${params.totalLessons}
- Duração de cada Aula: ${params.lessonDuration}
- Ementa: ${params.ementa}
- Objetivo Geral: ${params.objetivoGeral}
${params.fileContent ? `- Conteúdo adicional do arquivo: ${params.fileContent}` : ""}

Estrutura obrigatória da resposta:

{
 "syllabus": "<syllabus>",
 "general_objective": "<general_objective>",
 "specific_objectives": ["<specific_objective>"],
 "methodology": "<methodology>",
 "assessment": "<assessment>",
 "basic_references": ["<reference>"],
 "complementary_references": ["<reference>"],
 "lessons":[
  {
   "lesson_order":1,
   "title":"<lesson_title>",
   "specific_objectives":["<lesson_objective>"],
   "content":"<lesson_content>",
   "methodology":"<lesson_methodology>",
   "assessment":"<lesson_assessment>"
  }
 ]
}
`;

  const raw = await callOllama(prompt);
  console.log(raw);
  const plan = extractJSON<GeneratedPlan>(raw);

  if (!plan.lessons || plan.lessons.length === 0) {
    throw new Error("A IA não retornou nenhuma aula.");
  }

  return plan;
}

export async function regenerateLesson(params: {
  discipline: string;
  lessonOrder: number;
  totalLessons: number;
  ementa: string;
  objetivoGeral: string;
}): Promise<GeneratedPlan["lessons"][0]> {
  const prompt = `Você é um assistente pedagógico. Gere APENAS UMA aula universitária.

REGRAS:
- Retorne APENAS JSON válido, sem markdown, sem texto.
- A aula deve ser a de número ${params.lessonOrder} de ${params.totalLessons}.

DADOS:
- Disciplina: ${params.discipline}
- Ementa: ${params.ementa}
- Objetivo Geral: ${params.objetivoGeral}

FORMATO:
{
  "lesson_order": ${params.lessonOrder},
  "title": "",
  "specific_objectives": [],
  "content": "",
  "methodology": "",
  "assessment": ""
}

Retorne APENAS o JSON:`;

  const raw = await callOllama(prompt);
  return extractJSON<GeneratedPlan["lessons"][0]>(raw);
}

export async function generateActivity(params: {
  assessment: string;
  methodology: string;
  specificObjectives: string[];
}): Promise<LessonActivity> {
  const prompt = `Você é um assistente pedagógico. Gere UMA atividade avaliativa baseada nos dados abaixo.

REGRAS:
- Retorne APENAS JSON válido, sem markdown, sem texto explicativo.
- Todos os campos devem estar preenchidos.

DADOS:
- Avaliação: ${params.assessment}
- Metodologia: ${params.methodology}
- Objetivos Específicos: ${params.specificObjectives.join(", ")}

FORMATO:
{
  "activity_title": "",
  "description": "",
  "instructions": "",
  "evaluation_criteria": ["critério 1", "critério 2"]
}

Retorne APENAS o JSON:`;

  const raw = await callOllama(prompt);
  console.log(extractJSON<LessonActivity>(raw));
  return extractJSON<LessonActivity>(raw);
}
