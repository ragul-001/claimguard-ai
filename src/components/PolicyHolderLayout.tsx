import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Home, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

const PolicyHolderLayout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/");
      } else if (role && role !== "policy_holder") {
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
        <h2 className="text-2xl font-bold text-foreground mb-8">Policy Holder</h2>
        
        <nav className="space-y-2">
          <NavLink 
            to="/policy-holder/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/policy-holder/submit-claim" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <FileText className="w-5 h-5" />
            Submit Claim
          </NavLink>
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


export default PolicyHolderLayout;
