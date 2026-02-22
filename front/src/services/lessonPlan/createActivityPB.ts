import { pb } from "@/lib/pocketbase";

export async function createActivityPB(activity) {

    const payload = {
        title: activity.title,
        instructions: activity.instructions || "",
        points: Number(activity.points) || 0,
        topic: activity.topic || "",
        class: activity.classId, // sem array
        status: "em andamento",
        totalStudents: Number(activity.totalStudents) || 0,
    };

    if (activity.dueDate) {
        payload.dueDate = activity.dueDate;
    }

    if (activity.attachment) {
        payload.attachment = activity.attachment;
    }

    try {

        const activity = await pb.collection("activities").create(payload);

        console.log("ATIVIDADE CRIADA:", activity);

        return activity;

    } catch (error) {

        console.log("ERRO COMPLETO POCKETBASE ↓↓↓↓↓");

        console.log(error);

        console.log("DETALHE DO ERRO ↓↓↓↓↓");

        console.log(error.response);

        throw error;
    }
}