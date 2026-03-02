import { LogOut, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";

const CoderBotLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3 l7 3.5 l-7 3.5 l-7 -3.5 z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 3 l7 3.5 l-7 3.5 l-7 -3.5 z" />
    <path d="M19 6.5 v5" />
    <circle cx="19" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M6 11 v4 a6 6 0 0 0 12 0 v-4" />
    <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <path d="M10 17.5 q2 2 4 0" />
    <polyline points="3,11 0,14 3,17" />
    <polyline points="21,11 24,14 21,17" />
  </svg>
);

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800">
              <CoderBotLogo className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">{user?.name || "Professor"}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user?.role === "teacher" ? "Aqui está o resumo do desempenho das suas turmas." : "Visão geral do sistema."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:flex font-medium"
              onClick={() => navigate("/classes")}
            >
              <School className="h-4 w-4 mr-2" />
              Turmas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
