import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Claim {
  id: string;
  claim_amount: number;
  policy_number: string;
  hospital_name: string;
  admission_date: string;
  doctor_name: string;
  notes: string | null;
  status: string;
  fraud_prediction: number | null;
  fraud_probability: number | null;
  profiles: {
    full_name: string;
    email: string;
  };
}

const WorkerClaimReview = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchClaim();
  }, [claimId]);

  const fetchClaim = async () => {
    const { data: claimData, error } = await supabase
      .from("claims")
      .select("*")
      .eq("id", claimId)
      .single();

    if (error) {
      toast.error("Failed to fetch claim");
      navigate("/worker/dashboard");
      setLoading(false);
      return;
    }

    // Fetch profile for the claim
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", claimData.policy_holder_id)
      .single();

    setClaim({
      ...claimData,
      profiles: profile || { full_name: "Unknown", email: "Unknown" },
    });
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!claim) return;

    setVerifying(true);
    
    // Mock AI verification - in production, this would call your Flask backend
    const mockFraudScore = Math.random();
    const mockFraudPrediction = mockFraudScore > 0.6 ? 1 : 0;

    const { error } = await supabase
      .from("claims")
      .update({
        fraud_probability: mockFraudScore,
        fraud_prediction: mockFraudPrediction,
      })
      .eq("id", claim.id);

    if (error) {
      toast.error("Failed to verify claim");
    } else {
      toast.success("Claim verified with AI model");
      fetchClaim();
    }
    
    setVerifying(false);
  };

  const handleApprove = async () => {
    if (!claim || !user) return;

    const { error } = await supabase
      .from("claims")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", claim.id);

    if (error) {
      toast.error("Failed to approve claim");
    } else {
      toast.success("Claim approved successfully!");
      navigate("/worker/dashboard");
    }
  };

  const handleReject = async () => {
    if (!claim || !user || !rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    const { error } = await supabase
      .from("claims")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", claim.id);

    if (error) {
      toast.error("Failed to reject claim");
    } else {
      toast.success("Claim rejected");
      navigate("/worker/dashboard");
    }
  };

  const getRiskColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score < 0.3) return "text-risk-genuine";
    if (score < 0.6) return "text-risk-review";
    return "text-risk-suspicious";
  };

  const getRiskLevel = (score: number | null) => {
    if (!score) return "Not Verified";
    if (score < 0.3) return "Low Risk - Genuine";
    if (score < 0.6) return "Medium Risk - Review Required";
    return "High Risk - Suspicious";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!claim) return null;

  return (
    <div className="p-8">
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
              <span className="font-semibold text-foreground">{claim.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Patient Name:</span>
              <span className="font-semibold text-foreground">{claim.profiles.full_name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Hospital:</span>
              <span className="font-semibold text-foreground">{claim.hospital_name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Doctor:</span>
              <span className="font-semibold text-foreground">{claim.doctor_name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Bill Amount:</span>
              <span className="font-semibold text-accent">₹{claim.claim_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Admission Date:</span>
              <span className="font-semibold text-foreground">
                {new Date(claim.admission_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Policy Number:</span>
              <span className="font-semibold text-foreground">{claim.policy_number}</span>
            </div>
          </div>

          {claim.notes && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Additional Notes</h3>
              <p className="text-sm text-foreground">{claim.notes}</p>
            </div>
          )}
        </Card>

        {/* AI Fraud Analysis */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            AI Fraud Analysis
          </h2>

          <div className="space-y-6">
            {!claim.fraud_probability && (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full"
                size="lg"
              >
                {verifying ? "Verifying with AI Model..." : "Verify with AI Model"}
              </Button>
            )}

            {claim.fraud_probability !== null && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Fraud Risk Score
                    </span>
                    <span className={`text-2xl font-bold ${getRiskColor(claim.fraud_probability)}`}>
                      {(claim.fraud_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={claim.fraud_probability * 100} className="h-3" />
                  <p className={`mt-2 text-sm font-medium ${getRiskColor(claim.fraud_probability)}`}>
                    {getRiskLevel(claim.fraud_probability)}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">AI Model Prediction</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model Output:</span>
                      <Badge className={claim.fraud_prediction === 0 ? "bg-risk-genuine text-risk-genuine-foreground" : "bg-risk-suspicious text-risk-suspicious-foreground"}>
                        {claim.fraud_prediction === 0 ? "Genuine" : "Fraudulent"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="text-sm font-semibold text-foreground">
                        {((1 - claim.fraud_probability) * 100).toFixed(0)}%
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
                    disabled={claim.status !== "under_review"}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Approve Claim
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="outline"
                    className="w-full border-risk-suspicious text-risk-suspicious hover:bg-risk-suspicious/10"
                    size="lg"
                    disabled={claim.status !== "under_review"}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Claim
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection (Required)</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Provide a detailed reason for rejecting this claim..."
                maxLength={1000}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                className="flex-1 bg-risk-suspicious hover:bg-risk-suspicious/90 text-risk-suspicious-foreground"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerClaimReview;
