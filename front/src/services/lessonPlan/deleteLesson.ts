// services/lessonPlan/deleteLesson.ts
import { pb } from "@/lib/pocketbase";

export async function deleteLesson(lessonId: string) {
    try {
        await pb.collection("lessons").delete(lessonId);
    } catch (error) {
        console.error("Erro ao excluir aula:", error);
        throw new Error("Erro ao excluir aula.");
    }
}