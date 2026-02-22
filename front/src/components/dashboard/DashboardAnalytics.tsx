"use client";

import { useEffect, useState } from "react";
import {
  getDashboardAnalytics,
  DashboardAnalyticsResponse
} from "@/services/analytics-services";
import { Card } from "@/components/ui/card";
import { pb } from "@/lib/pocketbase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";

export function DashboardAnalytics() {
  const [data, setData] =
    useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const teacherId = pb.authStore.model?.id;
        if (!teacherId) return;

        const result = await getDashboardAnalytics(teacherId);
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p className="p-6">Carregando...</p>;
  if (!data) return <p className="p-6">Erro ao carregar dados.</p>;

  const { overview, students, alerts } = data;

  const riskColor = (risk: string) => {
    switch (risk) {
      case "vermelho":
        return "bg-red-500 text-white";
      case "amarelo":
        return "bg-yellow-500 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  const sortedStudents = [...students].sort((a, b) => {
    const riskOrder = { vermelho: 3, amarelo: 2, verde: 1 };
    return riskOrder[b.risk] - riskOrder[a.risk];
  });

  return (
    <div className="p-6 space-y-6">

      {/* ===================== */}
      {/* CONTEXTO GERAL */}
      {/* ===================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">
            Total de Sessões
          </h3>
          <p className="text-2xl font-bold">
            {overview.totalSessions}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">
            Tempo Médio por Aluno
          </h3>
          <p className="text-2xl font-bold">
            {formatDuration(overview.classMeanDuration)}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">
            Alunos em Alerta
          </h3>
          <p className="text-2xl font-bold text-red-500">
            {alerts.length}
          </p>
        </Card>
      </div>

      {/* MÉDIAS DA TURMA */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Médias da Turma
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Metric label="Engajamento Médio" value={overview.classMeanEngagement} />
          <Metric label="Desempenho Médio" value={overview.classMeanPerformance} />
          <Metric label="Progresso Médio" value={overview.classMeanProgress} />
          <Metric label="Autonomia Média" value={overview.classMeanAutonomy} />
        </div>
      </Card>

      {/* ===================== */}
      {/* ALERTAS */}
      {/* ===================== */}

      {alerts.length > 0 && (
        <Card className="p-4 border-red-300">
          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Alunos em Alerta
          </h2>

          <div className="space-y-2">
            {alerts.map((student) => (
              <div
                key={student.studentId}
                className="flex justify-between items-center border rounded p-2"
              >
                <span>{student.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${riskColor(
                    student.risk
                  )}`}
                >
                  {student.risk.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ===================== */}
      {/* CONTEXTO INDIVIDUAL */}
      {/* ===================== */}

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Métricas por Aluno
        </h2>

        <div className="space-y-4">
          {sortedStudents.map((student) => (
            <div
              key={student.studentId}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {student.name}
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${riskColor(
                    student.risk
                  )}`}
                >
                  {student.risk.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <Metric label="Engajamento" value={student.engagement} />
                <Metric label="Desempenho" value={student.performance} />
                <Metric label="Progresso" value={student.progress} />
                <Metric label="Autonomia" value={student.autonomy} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Distribuição de Risco
          </h2>
          <span className="text-sm text-muted-foreground">
            Situação atual da turma
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={[
                { name: "Baixo Risco", value: overview.riskDistribution.verde, color: "#16a34a" },
                { name: "Atenção", value: overview.riskDistribution.amarelo, color: "#f59e0b" },
                { name: "Alto Risco", value: overview.riskDistribution.vermelho, color: "#dc2626" }
              ]}
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                opacity={0.15}
              />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 8, 8]}
                barSize={32}
              >
                {[
                  "#16a34a",
                  "#f59e0b",
                  "#dc2626"
                ].map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground">{label}</p>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <p className="text-xs font-medium">
        {safeValue.toFixed(1)}
      </p>
    </div>
  );
}