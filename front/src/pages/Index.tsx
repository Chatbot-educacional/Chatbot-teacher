import { useState, useEffect } from "react";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div
          className="flex h-64 w-64 items-center justify-center"
          role="status"
          aria-label="Carregando"
        >
          <img
            src="/coderbot2.png"
            alt=""
            className="loading-logo-image h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return <TeacherDashboard />;
};

export default Index;
