import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Claim {
  id: string;
  claim_amount: number;
  policy_number: string;
  hospital_name: string;
  admission_date: string;
  doctor_name: string;
  status: string;
  fraud_probability: number | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const WorkerDashboardNew = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    const { data: claimsData, error } = await supabase
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch claims");
      setLoading(false);
      return;
    }

    // Fetch profiles for each claim
    const claimsWithProfiles = await Promise.all(
      (claimsData || []).map(async (claim) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", claim.policy_holder_id)
          .single();
        
        return {
          ...claim,
          profiles: profile || { full_name: "Unknown" },
        };
      })
    );

    setClaims(claimsWithProfiles);
    setLoading(false);
  };

  const getFilteredClaims = () => {
    if (filter === "all") return claims;
    return claims.filter((claim) => claim.status === filter);
  };

  const getRiskBadge = (score: number | null) => {
    if (!score) {
      return (
        <Badge className="bg-muted text-muted-foreground">
          Not Verified
        </Badge>
      );
    }
    
    if (score < 0.3) {
      return (
        <Badge className="bg-risk-genuine text-risk-genuine-foreground">
          Genuine
        </Badge>
      );
    } else if (score < 0.6) {
      return (
        <Badge className="bg-risk-review text-risk-review-foreground">
          Review
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-risk-suspicious text-risk-suspicious-foreground">
          Suspicious
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
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Claims Review Dashboard
        </h1>
        <p className="text-muted-foreground">Review claims with AI-powered fraud detection</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="approved">Accepted Claims</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Claims</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Claim ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Hospital
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Fraud Score
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {getFilteredClaims().map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {claim.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {claim.profiles?.full_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {claim.hospital_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        ₹{claim.claim_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-foreground">
                          {claim.fraud_probability 
                            ? `${(claim.fraud_probability * 100).toFixed(0)}%`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getRiskBadge(claim.fraud_probability)}</td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/worker/review/${claim.id}`)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {getFilteredClaims().length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No claims found in this category.
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkerDashboardNew;
