import { pb } from '@/lib/pocketbase';

export async function getLessonPlanByClass(classId: string) {
    const records = await pb.collection("lesson_plans").getFullList({
        filter: `class="${classId}"`,
    });

    return records.length > 0 ? records[0] : null;
}