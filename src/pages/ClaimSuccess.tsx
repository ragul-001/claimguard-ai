import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const ClaimSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 via-background to-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-success animate-in zoom-in duration-700 delay-200" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Claim Submitted!</h1>
          <p className="text-muted-foreground">
            Your insurance claim has been successfully submitted and is being processed.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Claim ID:</span>
            <span className="font-semibold text-foreground">CLM-2024-{Math.floor(Math.random() * 10000)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold text-accent">Under Review</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected Response:</span>
            <span className="font-semibold text-foreground">24-48 hours</span>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={() => navigate("/policy-holder/submit-claim")}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Submit Another Claim
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ClaimSuccess;
