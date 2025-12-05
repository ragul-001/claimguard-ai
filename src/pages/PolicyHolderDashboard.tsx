import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Claim {
  id: string;
  claim_amount: number;
  policy_number: string;
  hospital_name: string;
  admission_date: string;
  doctor_name: string;
  account_number: string | null;
  notes: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

const PolicyHolderDashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [user]);

  const fetchClaims = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .eq("policy_holder_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch claims");
    } else {
      setClaims(data || []);
    }
    setLoading(false);
  };

  const handleAddAccount = async () => {
    if (!selectedClaim || !accountNumber.trim()) return;

    const { error } = await supabase
      .from("claims")
      .update({ account_number: accountNumber })
      .eq("id", selectedClaim.id);

    if (error) {
      toast.error("Failed to add account details");
    } else {
      toast.success("Account details added successfully!");
      setShowAccountDialog(false);
      setAccountNumber("");
      fetchClaims();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-risk-genuine text-risk-genuine-foreground">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-risk-suspicious text-risk-suspicious-foreground">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-risk-review text-risk-review-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Claims</h1>

      {claims.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No claims submitted yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {claim.hospital_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Policy: {claim.policy_number}
                  </p>
                </div>
                {getStatusBadge(claim.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Claim Amount</p>
                  <p className="font-semibold text-foreground">
                    ₹{claim.claim_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-semibold text-foreground">{claim.doctor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(claim.admission_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-semibold text-foreground">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {claim.status === "approved" && (
                <div className="mt-4 p-4 bg-risk-genuine/10 rounded-lg">
                  <p className="text-risk-genuine font-semibold mb-2">
                    ✓ Your claim has been approved successfully!
                  </p>
                  {!claim.account_number ? (
                    <Button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setShowAccountDialog(true);
                      }}
                      className="bg-risk-genuine hover:bg-risk-genuine/90 text-risk-genuine-foreground"
                    >
                      Add Bank Account for Payout
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Payout will be processed to account: ****{claim.account_number.slice(-4)}
                    </p>
                  )}
                </div>
              )}

              {claim.status === "rejected" && claim.rejection_reason && (
                <div className="mt-4 p-4 bg-risk-suspicious/10 rounded-lg">
                  <p className="text-risk-suspicious font-semibold mb-1">Rejection Reason:</p>
                  <p className="text-foreground">{claim.rejection_reason}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountNumber">Bank Account Number</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                maxLength={20}
              />
            </div>
            <Button onClick={handleAddAccount} className="w-full">
              Submit Account Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyHolderDashboard;
