import { pb } from '@/lib/pocketbase';


interface ActivityInput {
  title: string;
  instructions?: string;
  points?: number | string;
  dueDate?: string | null;
  topic?: string;
  classId: string;
  totalStudents?: number;
  attachment?: string;
}

export const createActivityPB = async (activity: ActivityInput) => {
  try {
    const newActivity = await pb.collection("activities").create({
      title: activity.title,
      instructions: activity.instructions || "",
      points: activity.points ? Number(activity.points) : 0,
      dueDate: activity.dueDate || null,
      topic: activity.topic || "",
      class: [activity.classId],
      status: "em andamento", 
      submittedCount: 0,
      totalStudents: activity.totalStudents || 0,
      attachment: activity.attachment || "",
      
    });

    console.log("Atividade criada no PocketBase:", newActivity);
    return newActivity;
  } catch (error) {
    console.error("Erro ao criar atividade no PocketBase:", error);
    throw error;
  }
};

