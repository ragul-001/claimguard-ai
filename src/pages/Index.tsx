import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!authLoading && !roleLoading && user && role) {
      if (role === "policy_holder") {
        navigate("/policy-holder/dashboard");
      } else if (role === "insurance_worker") {
        navigate("/worker/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-primary/20 p-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4">
          AI Health Insurance Claim Verification System
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Select your role to continue
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
            onClick={() => navigate('/signup?role=policy_holder')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Users className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">Policy Holder</h2>
              <p className="text-muted-foreground">
                Submit and track your insurance claims
              </p>
              <Button className="w-full mt-4">Get Started</Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-accent"
            onClick={() => navigate('/signup?role=insurance_worker')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="w-16 h-16 text-accent group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">Insurance Worker</h2>
              <p className="text-muted-foreground">
                Review and verify claims with AI assistance
              </p>
              <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Get Started</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
