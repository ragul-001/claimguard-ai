import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-primary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI Health Insurance Claims
          </h1>
          <p className="text-lg text-muted-foreground">
            Advanced fraud detection powered by machine learning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Policy Holder Card */}
          <Card className="p-8 hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-2 hover:border-primary cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Policy Holder</h2>
                <p className="text-muted-foreground">
                  Submit and track your insurance claims securely
                </p>
              </div>
              <Button
                onClick={() => navigate("/policy-holder/login")}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                size="lg"
              >
                Continue as Policy Holder
              </Button>
            </div>
          </Card>

          {/* Insurance Worker Card */}
          <Card className="p-8 hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-2 hover:border-accent cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Insurance Worker</h2>
                <p className="text-muted-foreground">
                  Review claims with AI-powered fraud detection
                </p>
              </div>
              <Button
                onClick={() => navigate("/worker/login")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Continue as Worker
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
