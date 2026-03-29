import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SpendProvider } from "@/context/SpendContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MouseParallax } from "@/components/MouseParallax";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auditor from "./pages/Auditor";
import TriageQueue from "./pages/TriageQueue";
import RulesAndCategories from "./pages/RulesAndCategories";
import Insights from "./pages/Insights";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === "/") {
      return <Navigate to="/welcome" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <ProtectedRoute>
      <SpendProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full relative z-10">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-12 flex items-center border-b border-border/50 px-4 shrink-0">
                <SidebarTrigger />
              </header>
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/triage" element={<TriageQueue />} />
                  <Route path="/auditor" element={<Auditor />} />
                  <Route path="/rules-and-categories" element={<RulesAndCategories />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SpendProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MouseParallax />
          <Routes>
            <Route path="/welcome" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
