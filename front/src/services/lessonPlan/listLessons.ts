// services/lessonPlan/listLessons.ts
import { pb } from "@/lib/pocketbase";

export async function listLessons(classId: string) {
    try {
        const lessons = await pb.collection("lessons").getFullList({
            filter: `class_id = "${classId}"`,
            sort: "lesson_order",  // Ordenar pela ordem da aula
        });
        return lessons;
    } catch (error) {
        console.error("Erro ao listar aulas:", error);
        throw new Error("Erro ao listar aulas.");
    }
}