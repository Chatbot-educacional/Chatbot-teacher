import { Request, Response } from "express";
import pb from "../services/pocketbase.service";

interface User {
  id: string;
  role: "student" | "teacher" | string;
}

interface Session {
  id: string;
  userId: string;
  teacherId: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
}

interface ClassMember {
  id: string;
  user: string;
  class: string;
}

interface ClassInfo {
  id: string;
  createdBy: string;
}

export async function startSession(req: Request, res: Response): Promise<Response> {
  try {
    const { user, teacher } = req.body;

    if (!user) return res.status(400).json({ error: "user é obrigatório" });
    if (!teacher) return res.status(400).json({ error: "teacher é obrigatório" });

    const userData = (await pb.collection("users").getOne(user).catch(() => null)) as User | null;
    const teacherData = (await pb.collection("users").getOne(teacher).catch(() => null)) as User | null;

    if (!userData || userData.role !== "student")
      return res.status(400).json({ error: "Usuário inválido" });
    if (!teacherData || teacherData.role !== "teacher")
      return res.status(400).json({ error: "Professor inválido" });

    const sessionData = {
      userId: userData.id,
      teacherId: teacherData.id,
      start_time: new Date().toISOString(),
      end_time: null,
      duration_seconds: 0,
    };

    const session = (await pb.collection("sessions").create(sessionData)) as Session;
    return res.status(201).json({ message: "Sessão iniciada com sucesso", data: session });
  } catch (err: any) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      error: err.response?.message || "Erro interno ao iniciar sessão",
      details: err.response?.data,
    });
  }
}

export async function endSession(req: Request, res: Response): Promise<Response> {
  try {
    const { sessionId } = req.body;
    if (!sessionId)
      return res.status(400).json({ error: "sessionId é obrigatório" });

    const session = (await pb.collection("sessions").getOne(sessionId)) as Session;
    if (!session) return res.status(404).json({ error: "Sessão não encontrada" });
    if (session.end_time)
      return res.status(200).json({ message: "Sessão já encerrada", data: session });

    const start = new Date(session.start_time);
    const end = new Date();
    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));

    const updated = (await pb.collection("sessions").update(sessionId, {
      end_time: end.toISOString(),
      duration_seconds: duration,
    })) as Session;

    return res.json({
      message: "Sessão encerrada com sucesso",
      duration_seconds: duration,
      duration_minutes: (duration / 60).toFixed(2),
      data: updated,
    });
  } catch (err: any) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      error: err.response?.message || "Erro interno ao encerrar sessão",
      details: err.response?.data,
    });
  }
}

export async function getAverageSessionTimeByClass(req: Request, res: Response): Promise<Response> {
  try {
    const { classId } = req.params;
    if (!classId)
      return res.status(400).json({ error: "classId é obrigatório" });

    const classMembers = (await pb.collection("class_members").getFullList({
      filter: `class="${classId}"`,
    })) as ClassMember[];

    if (classMembers.length === 0)
      return res.json({ formatted: "0h 0m", average_seconds: 0, sessions_count: 0 });

    const studentIds = classMembers.map((member) => member.user).flat();
    if (studentIds.length === 0)
      return res.json({ formatted: "0h 0m", average_seconds: 0, sessions_count: 0 });

    const classInfo = (await pb.collection("classes").getOne(classId)) as ClassInfo;
    const teacherId = classInfo.createdBy;

    if (!teacherId)
      return res.status(400).json({ error: "teacherId não encontrado para a turma" });

    const userFilters = studentIds.map((id) => `userId~"${id}"`).join(" || ");
    const filter = `${userFilters} && teacherId~"${teacherId}" && duration_seconds > 0`;

    const sessions = (await pb.collection("sessions").getFullList({
      filter,
      sort: "-start_time",
    })) as Session[];

    if (sessions.length === 0)
      return res.json({ formatted: "0h 0m", average_seconds: 0, sessions_count: 0 });

    const totalDuration = sessions.reduce(
      (acc, s) => acc + (s.duration_seconds || 0),
      0
    );
    const avgSeconds = totalDuration / sessions.length;

    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);

    return res.json({
      formatted: `${hours}h ${minutes}m`,
      average_seconds: Math.round(avgSeconds),
      sessions_count: sessions.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Erro ao calcular tempo médio das sessões da turma",
      details: err.response?.data || err.message,
    });
  }
}
