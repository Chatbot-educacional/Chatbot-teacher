import { Request, Response } from "express";
import pb from "../services/pocketbase.service";

interface ClassRecord {
  id: string;
  name: string;
}

interface ClassMember {
  id: string;
  role: "student" | "teacher" | string;
  class: string;
  expand?: {
    class?: ClassRecord;
  };
}

interface ClassSummary {
  class: string;
  total_students: number;
}

export async function listClassesWithStudentCount(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const members = (await pb.collection("class_members").getFullList({
      expand: "class",
    })) as ClassMember[];

    const summary = members
      .filter((m) => m.role === "student")
      .reduce<Record<string, number>>((acc, member) => {
        const className = member.expand?.class?.name || "Turma sem nome";
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {});

    const result: ClassSummary[] = Object.entries(summary).map(
      ([className, total]) => ({
        class: className,
        total_students: total,
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    res.status(500).json({ error: "Erro ao listar turmas" });
  }
}
