import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/dashboard/PrivateRoute";

const queryClient = new QueryClient();

const resolveRouterBase = () => {
  const configured = import.meta.env.VITE_APP_BASE_PATH;
  const fallback = import.meta.env.DEV ? "/" : "/teacher";
  const value = configured ?? fallback;

  if (!value || value === "/") {
    return "/";
  }

  let normalized = value.trim();

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return normalized.replace(/\/+$/, "");
};

const routerBase = resolveRouterBase();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={routerBase === "/" ? undefined : routerBase}>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <Index />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>

  </QueryClientProvider>
);

export default App;
