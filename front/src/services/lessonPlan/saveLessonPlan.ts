import { pb } from "@/lib/pocketbase";

// Salvar plano de aula e as aulas associadas na coleção 'lesson'
export async function saveLessonPlan(data: any) {
    const user = pb.authStore.model;
    if (!user) throw new Error("Usuário não autenticado");

    const payload = {
        discipline: data.discipline,
        course: data.course,
        workload: data.workload,
        total_lessons: data.totalLessons,
        lesson_duration: data.lessonDuration,
        syllabus: data.syllabus,
        general_objective: data.general_objective,
        specific_objectives: data.specific_objectives,
        methodology: data.methodology,
        assessment: data.assessment,
        basic_references: data.basic_references,
        complementary_references: data.complementary_references,
        status: data.status || "draft",
        version: data.version || 1,
    };

    try {
        // Salvar o plano de aula na coleção 'lesson_plans'
        const savedPlan = await pb.collection("lesson_plans").create(payload);
        console.log("Plano de Aula Salvo:", savedPlan);

        // Agora salvar as aulas na coleção 'lesson'
        for (let i = 1; i <= data.totalLessons; i++) {
            const lessonPayload = {
                lesson_order: i,
                lesson_plan_id: savedPlan.id,  // Relaciona a aula com o plano de aula
                syllabus: data.syllabus,      // Dados da ementa (pode ser customizado)
                specific_objectives: data.specific_objectives,  // Objetivos específicos
                methodology: data.methodology,   // Metodologia
                assessment: data.assessment,     // Avaliação
                // Outros campos adicionais que você precise
            };

            console.log("Criando aula:", lessonPayload);

            // Criar um registro de aula na coleção 'lesson'
            await pb.collection("lessons").create(lessonPayload);  // Se o nome da coleção for 'lessons', altere aqui
        }

        return savedPlan;
    } catch (error) {
        console.error("Erro ao salvar plano de aula e aulas:", error);
        throw new Error("Erro ao salvar plano de aula e aulas");
    }
}