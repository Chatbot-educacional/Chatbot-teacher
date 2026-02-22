import { pb } from "@/lib/pocketbase";
import { generateLessons } from "./lesson-stream-service";

export async function saveLessonPlan(data) {

    const payload = {
        title: data.title,
        content: data.content,
        total_lessons: data.totalLessons,
        lesson_duration: data.lessonDuration,
        syllabus: data.syllabus,
        general_objective: data.generalObjective,
        status: data.status,
        class: data.classId,
        user: pb.authStore.model?.id,
    };

    let plan;

    try {

        if (data.id) {
            plan = await pb.collection("lesson_plans").update(data.id, payload);
        } else {
            plan = await pb.collection("lesson_plans").create(payload);
        }

    } catch {
        plan = await pb.collection("lesson_plans").create(payload);
    }

    // 🔥 AQUI COMEÇA A GERAÇÃO DAS AULAS
    generateLessons({
        totalLessons: plan.total_lessons,
        syllabus: plan.syllabus,
        lessonPlanId: plan.id,
        classId: plan.class,
        userId: plan.user
    });

    return plan;
}