// services/lessonPlan/saveLessonPlan.ts
import { pb } from "@/lib/pocketbase";

export async function saveLessonPlan(data: any) {
    const user = pb.authStore.model;
    if (!user) throw new Error("Usuário não autenticado");

    const payload = {
        discipline: data.discipline,
        course: data.course,
        workload: data.workload,
        total_lessons: data.totalLessons,
        lesson_duration: data.lessonDuration,
        class_id: data.classId,
        status: data.status || "draft",  // Rascunho ou aprovado
        syllabus: data.syllabus,
        general_objective: data.general_objective,
        specific_objectives: data.specific_objectives,
        methodology: data.methodology,
        assessment: data.assessment,
        basic_references: data.basic_references,
        complementary_references: data.complementary_references,
    };

    // Criar ou atualizar o plano de aula
    if (data.id) {
        return await pb.collection("lesson_plans").update(data.id, payload);
    }

    return await pb.collection("lesson_plans").create(payload);
}