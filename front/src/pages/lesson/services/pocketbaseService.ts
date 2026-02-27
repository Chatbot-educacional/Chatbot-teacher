import type { LessonPlanRecord, LessonRecord, Lesson } from "@/types/lessonPlan";

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";

async function pbFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PB_URL}/api/collections${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PocketBase error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function saveLessonPlan(
  plan: LessonPlanRecord,
  lessons: Lesson[]
): Promise<{ planId: string; lessonIds: string[] }> {
  const createdPlan = await pbFetch<{ id: string }>("/lesson_plans/records", {
    method: "POST",
    body: JSON.stringify(plan),
  });

  const activeLessons = lessons.filter((l) => !l.isDeleted);
  const lessonIds: string[] = [];

  for (const lesson of activeLessons) {
    const record: LessonRecord = {
      lesson_order: lesson.lesson_order,
      lesson_plan_id: createdPlan.id,
      title: lesson.title,
      specific_objectives: lesson.specific_objectives,
      content: lesson.content,
      methodology: lesson.methodology,
      assessment: lesson.assessment,
      activity: lesson.activity ?? null,
    };

    const created = await pbFetch<{ id: string }>("/lessons/records", {
      method: "POST",
      body: JSON.stringify(record),
    });
    lessonIds.push(created.id);
  }

  return { planId: createdPlan.id, lessonIds };
}
