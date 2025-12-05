import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ClaimReview = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();

  // Mock claim data
  const claim = {
    id: claimId,
    patientName: "Ravi Kumar",
    hospital: "KMCH",
    diagnosis: "Fracture",
    amount: 45000,
    stayDuration: 3,
    fraudScore: 0.33,
    fraudPrediction: 0,
  };

  const handleApprove = () => {
    toast.success("Claim approved successfully!");
    navigate("/worker/dashboard");
  };

  const handleReject = () => {
    toast.error("Claim rejected");
    navigate("/worker/dashboard");
  };

  const getRiskColor = (score: number) => {
    if (score < 0.3) return "text-risk-genuine";
    if (score < 0.6) return "text-risk-review";
    return "text-risk-suspicious";
  };

  const getRiskLevel = (score: number) => {
    if (score < 0.3) return "Low Risk - Genuine";
    if (score < 0.6) return "Medium Risk - Review Required";
    return "High Risk - Suspicious";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-primary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/worker/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Claim Details */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Claim Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Claim ID:</span>
                <span className="font-semibold text-foreground">{claim.id}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Patient Name:</span>
                <span className="font-semibold text-foreground">{claim.patientName}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Hospital:</span>
                <span className="font-semibold text-foreground">{claim.hospital}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Diagnosis:</span>
                <span className="font-semibold text-foreground">{claim.diagnosis}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Bill Amount:</span>
                <span className="font-semibold text-accent">₹{claim.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Stay Duration:</span>
                <span className="font-semibold text-foreground">{claim.stayDuration} days</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Uploaded Documents</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Medical Bill - KMCH_Invoice_2024.pdf</p>
                <p>• Discharge Summary - Discharge_Summary.pdf</p>
                <p>• Prescription - Prescription_12345.pdf</p>
              </div>
            </div>
          </Card>

          {/* AI Fraud Analysis */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              AI Fraud Analysis
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Fraud Risk Score
                  </span>
                  <span className={`text-2xl font-bold ${getRiskColor(claim.fraudScore)}`}>
                    {(claim.fraudScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={claim.fraudScore * 100} className="h-3" />
                <p className={`mt-2 text-sm font-medium ${getRiskColor(claim.fraudScore)}`}>
                  {getRiskLevel(claim.fraudScore)}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-3">AI Model Prediction</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Model Output:</span>
                    <Badge className={claim.fraudPrediction === 0 ? "bg-risk-genuine text-risk-genuine-foreground" : "bg-risk-suspicious text-risk-suspicious-foreground"}>
                      {claim.fraudPrediction === 0 ? "Genuine" : "Fraudulent"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {((1 - claim.fraudScore) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Verification Checks</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-risk-genuine" />
                    <span className="text-foreground">Hospital verified in network</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-risk-genuine" />
                    <span className="text-foreground">Policy active and valid</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-risk-review" />
                    <span className="text-foreground">Amount within policy limits</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button
                  onClick={handleApprove}
                  className="w-full bg-risk-genuine hover:bg-risk-genuine/90 text-risk-genuine-foreground"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Approve Claim
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="w-full border-risk-suspicious text-risk-suspicious hover:bg-risk-suspicious/10"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Claim
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClaimReview;
