export function buildLessonPrompt({
  lessonNumber,
  totalLessons,
  syllabus
}) {

  return `
Você é um especialista em pedagogia.

Crie a aula ${lessonNumber} de ${totalLessons}.

Ementa da disciplina:
${syllabus}

RESPONDA APENAS COM JSON VÁLIDO.

NÃO escreva explicações.
NÃO escreva texto fora do JSON.

Formato obrigatório:

{
  "lesson": {
    "title": "Título da aula",
    "objectives": ["objetivo 1","objetivo 2"],
    "content": ["conteúdo 1","conteúdo 2"],
    "methodology": "descrição",
    "evaluation": "descrição"
  },
  "activity": {
    "title": "Título da atividade",
    "instructions": "instruções da atividade",
    "points": 10,
    "topic": "tema da atividade"
  }
}
`;
}