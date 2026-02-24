import { pb } from "@/lib/pocketbase";

export async function getLessonPlanByClass(classId: string) {
    try {
        console.log(classId);
        // Aqui passamos o filtro diretamente como string
        const plan = await pb.collection("lesson_plans").getFirstListItem(
            `class_id = "${classId}"`
        );
        console.log(plan);
        return plan;
    } catch (error) {
        console.error("Erro ao carregar plano de aula:", error);
        return null;
    }
}