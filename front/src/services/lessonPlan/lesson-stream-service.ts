import { buildLessonPrompt } from "./lesson-prompt-service";
import { saveLesson } from "./lesson-save-service";
import { createActivityPB } from "./createActivityPB";
import { generateWithOllama } from "@/services/ollama-service";
import { safeJsonParse } from "./utils/safeJsonParse";

export async function generateLessons({
    totalLessons,
    syllabus,
    lessonPlanId,
    classId,
    userId
}) {

    for (let i = 1; i <= totalLessons; i++) {

        try {

            console.log("Gerando aula", i);

            const prompt = buildLessonPrompt({
                lessonNumber: i,
                totalLessons,
                syllabus
            });

            const raw = await generateWithOllama({
                prompt,
                stream: false
            });

            console.log("Resposta IA:", raw);

            const parsed = safeJsonParse(raw);

            if (!parsed?.lesson) {
                console.error("Lesson inválida:", parsed);
                continue;
            }

            const savedLesson = await saveLesson({
                lesson: parsed.lesson,
                lessonNumber: i,
                lessonPlanId,
                classId,
                userId
            });

            console.log("Lesson salva:", savedLesson);

            if (parsed.activity) {

                await createActivityPB({
                    title: parsed.activity.title,
                    instructions: parsed.activity.instructions,
                    points: parsed.activity.points,
                    topic: parsed.activity.topic,
                    lessonId: savedLesson.id,
                    classId
                });

                console.log("Atividade criada");
            }

            console.log("Aula criada:", i);

        } catch (error) {

            console.error("Erro ao gerar aula", i, error);

        }
    }
}