// services/ragService.ts

import type { GeneratedPlan, LessonActivity, Lesson } from "@/pages/lesson/types/lessonPlan";

// ===============================
// 🔧 CONFIG
// ===============================
type Provider = "openai" | "anthropic";

interface LLMConfig {
  provider: Provider;
  model: string;
  apiKey?: string;
}

// 👉 modelo padrão (troque dinamicamente se quiser)
const DEFAULT_MODEL: LLMConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
};

// ===============================
// 🔍 MINI-RAG (RELEVÂNCIA SIMPLES)
// ===============================
function extrairTrechosRelevantes(texto: string, topico: string, limite: number = 10): string {
  const paragrafos = texto.split("\n");
  const relevantes: string[] = [];

  for (const p of paragrafos) {
    if (topico.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(topico.toLowerCase())) {
      relevantes.push(p.trim());
    }
  }

  // fallback: pega primeiros parágrafos se não achar nada
  if (relevantes.length === 0) {
    return paragrafos.slice(0, limite).join("\n");
  }

  return relevantes.slice(0, limite).join("\n");
}

// ===============================
// 🥁 CALL LLM COM STREAM
// ===============================
async function* callLLMStream(prompt: string, config: LLMConfig): AsyncGenerator<string> {
  switch (config.provider) {
    case "openai":
      yield* callOpenAIStream(prompt, config);
      break;
    case "anthropic":
      yield* callClaudeStream(prompt, config);
      break;
    default:
      throw new Error("Provider inválido");
  }
}

// ===============================
// CALL LLM (NÃO-STREAM)
// ===============================
async function callLLM(prompt: string, config: LLMConfig): Promise<string> {
  switch (config.provider) {
    case "openai":
      return callOpenAI(prompt, config);
    case "anthropic":
      return callClaude(prompt, config);
    default:
      throw new Error("Provider inválido");
  }
}

// ===============================
// OPENAI - STREAM
// ===============================
async function* callOpenAIStream(prompt: string, config: LLMConfig): AsyncGenerator<string> {
  const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_OPENAI_KEY não configurada");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: "Você é um professor universitário experiente em Ciência da Computação. Responda SOMENTE em JSON válido." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      stream: true,
    } ),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI Error: ${error.error?.message || "Unknown error"}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Sem stream disponível");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Ignora linhas inválidas
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ===============================
// OPENAI - NÃO-STREAM
// ===============================
async function callOpenAI(prompt: string, config: LLMConfig): Promise<string> {
  const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_OPENAI_KEY não configurada");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: "Você é um professor universitário experiente em Ciência da Computação. Responda SOMENTE em JSON válido." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    } ),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI Error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ===============================
// CLAUDE - STREAM
// ===============================
async function* callClaudeStream(prompt: string, config: LLMConfig): AsyncGenerator<string> {
  const apiKey = config.apiKey || import.meta.env.VITE_ANTHROPIC_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_ANTHROPIC_KEY não configurada");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4000,
      system: "Você é um professor universitário experiente em Ciência da Computação. Responda SOMENTE em JSON válido.",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    } ),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude Error: ${error.error?.message || "Unknown error"}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Sem stream disponível");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              yield parsed.delta.text;
            }
          } catch {
            // Ignora linhas inválidas
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ===============================
// CLAUDE - NÃO-STREAM
// ===============================
async function callClaude(prompt: string, config: LLMConfig): Promise<string> {
  const apiKey = config.apiKey || import.meta.env.VITE_ANTHROPIC_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_ANTHROPIC_KEY não configurada");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4000,
      system: "Você é um professor universitário experiente em Ciência da Computação. Responda SOMENTE em JSON válido.",
      messages: [{ role: "user", content: prompt }],
    } ),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude Error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

// ===============================
// 🛠 JSON SAFE
// ===============================
function safeParse<T>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("JSON inválido: não encontrado");
    }
    return JSON.parse(raw.slice(start, end + 1));
  }
}

// ===============================
// 🎓 GENERATE PLAN
// ===============================
export async function generateLessonPlan(params: {
  discipline: string;
  course: string;
  workload: string;
  totalLessons: number;
  lessonDuration: string;
  ementa: string;
  objetivoGeral: string;
  fileContent?: string;
  modelConfig?: LLMConfig;
}): Promise<GeneratedPlan> {
  const config = params.modelConfig || DEFAULT_MODEL;

  // 🔥 CONTEXTO INTELIGENTE
  let contexto = "";

  if (params.fileContent && params.fileContent.trim()) {
    const textoRelevante = extrairTrechosRelevantes(params.fileContent, params.ementa);
    contexto = `
=== MATERIAL DE REFERÊNCIA (USO OBRIGATÓRIO) ===
\${textoRelevante}
=== FIM DO MATERIAL ===
`;
  }

  // 🧠 PROMPT FORTE (GROUNDING REAL)
  const prompt = `
You are a highly experienced university professor in Computer Science.

Your task is to generate a BEGINNER-level teaching plan.

This is a controlled experiment with EXACTLY \${params.totalLessons} lessons.

Each lesson MUST correspond to the topic: \${params.ementa}

==================================================
STRICT PEDAGOGICAL RULES
==================================================

Beginner level means:
- simple language
- step-by-step explanations
- no advanced terminology without explanation
- concrete examples in every lesson

Lessons MUST follow progressive difficulty:
- Lesson 1: introduction
- Lesson 2: application
- Lesson 3: practice and consolidation

Each lesson MUST include a clear learning objective.

==================================================
STRICT CONTENT RULES
==================================================

- Generate EXACTLY \${params.totalLessons} lessons
- Each lesson uses the given topic
- Do NOT introduce new topics
- Do NOT mix topics
- Keep content beginner-level

Each lesson MUST include at least one interactive student action (question, exercise, or mini-task).

==================================================
CRITICAL STRUCTURE RULES
==================================================

You MUST follow the structure EXACTLY.

Each lesson MUST contain EXACTLY these fields:
- lesson_order (number)
- title (string)
- specific_objectives (array of strings)
- content (string)
- methodology (string)
- assessment (string)

==================================================
CONTEXT
==================================================

Disciplina: \${params.discipline}
Curso: \${params.course}
Carga horária: \${params.workload}
Duração da aula: \${params.lessonDuration}
Objetivo: \${params.objetivoGeral}
Ementa: \${params.ementa}

\${contexto}

==================================================
OUTPUT LANGUAGE
==================================================

Brazilian Portuguese (pt-BR)

==================================================
OUTPUT FORMAT (STRICT JSON)
==================================================

{
  "syllabus": "string",
  "general_objective": "string",
  "specific_objectives": ["string"],
  "methodology": "string",
  "assessment": "string",
  "basic_references": ["string"],
  "complementary_references": ["string"],
  "lessons": [
    {
      "lesson_order": 1,
      "title": "string",
      "specific_objectives": ["string"],
      "content": "string",
      "methodology": "string",
      "assessment": "string"
    }
  ]
}

==================================================
FINAL RULE
==================================================

If you do not follow ALL rules above EXACTLY, your answer is INVALID.
`;

  const raw = await callLLM(prompt, config);
  return safeParse<GeneratedPlan>(raw);
}

// ===============================
// 🔁 REGENERATE
// ===============================
export async function regenerateLesson(params: {
  discipline: string;
  lessonOrder: number;
  totalLessons: number;
  ementa: string;
  objetivoGeral: string;
  modelConfig?: LLMConfig;
}): Promise<Lesson> {
  const config = params.modelConfig || DEFAULT_MODEL;

  const prompt = `
Gere UMA aula em JSON.

Aula \${params.lessonOrder} de \${params.totalLessons}
Disciplina: \${params.discipline}
Ementa: \${params.ementa}
Objetivo: \${params.objetivoGeral}

FORMATO:
{
  "lesson_order": \${params.lessonOrder},
  "title": "string",
  "specific_objectives": ["string"],
  "content": "string",
  "methodology": "string",
  "assessment": "string"
}

Responda SOMENTE em JSON válido.
`;

  const raw = await callLLM(prompt, config);
  return safeParse<Lesson>(raw);
}

// ===============================
// 🧪 ACTIVITY
// ===============================
export async function generateActivity(params: {
  assessment: string;
  methodology: string;
  specificObjectives: string[];
  modelConfig?: LLMConfig;
}): Promise<LessonActivity> {
  const config = params.modelConfig || DEFAULT_MODEL;

  const prompt = `
Crie atividade avaliativa em JSON.

Objetivos: \${params.specificObjectives.join(", ")}
Metodologia: \${params.methodology}
Critérios de Avaliação: \${params.assessment}

FORMATO:
{
  "activity_title": "string",
  "description": "string",
  "instructions": "string",
  "evaluation_criteria": ["string"]
}

Responda SOMENTE em JSON válido.
`;

  const raw = await callLLM(prompt, config);
  return safeParse<LessonActivity>(raw);
}
