import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

const WorkerLayout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/");
      } else if (role && role !== "insurance_worker") {
        navigate("/");
      }
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-secondary via-background to-primary/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6">
        <h2 className="text-2xl font-bold text-foreground mb-8">Insurance Worker</h2>
        
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/worker/dashboard")}
          >
            <FileText className="w-5 h-5 mr-3" />
            Review Claims
          </Button>
        </nav>

        <div className="mt-auto pt-8">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkerLayout;
