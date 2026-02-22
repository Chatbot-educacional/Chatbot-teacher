import { pb } from "@/lib/pocketbase";

export async function saveLesson({
    lesson,
    lessonNumber,
    lessonPlanId,
    classId,
    userId
}) {

    return await pb.collection("lessons").create({

        title: lesson.title,

        objectives: lesson.objectives,

        content: lesson.content,

        methodology: lesson.methodology,

        evaluation: lesson.evaluation,

        lesson_number: lessonNumber,

        lesson_plan: lessonPlanId,

        class: classId,

        user: userId
    });
}