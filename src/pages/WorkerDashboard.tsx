import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

// Mock data for claims
const mockClaims = [
  {
    id: "CLM-2024-1001",
    patientName: "Ravi Kumar",
    hospital: "KMCH",
    diagnosis: "Fracture",
    amount: 45000,
    fraudScore: 0.33,
    status: "pending",
  },
  {
    id: "CLM-2024-1002",
    patientName: "Priya Sharma",
    hospital: "Apollo Hospital",
    diagnosis: "Appendicitis",
    amount: 75000,
    fraudScore: 0.15,
    status: "pending",
  },
  {
    id: "CLM-2024-1003",
    patientName: "Amit Patel",
    hospital: "Fortis Healthcare",
    diagnosis: "Cardiac Surgery",
    amount: 250000,
    fraudScore: 0.82,
    status: "pending",
  },
  {
    id: "CLM-2024-1004",
    patientName: "Sneha Reddy",
    hospital: "Max Hospital",
    diagnosis: "Pneumonia",
    amount: 35000,
    fraudScore: 0.48,
    status: "pending",
  },
];

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const getRiskBadge = (score: number) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-primary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Claims Review Dashboard
          </h1>
          <p className="text-muted-foreground">Review claims with AI-powered fraud detection</p>
        </div>

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
                {mockClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {claim.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {claim.patientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {claim.hospital}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      ₹{claim.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-mono text-foreground">
                        {(claim.fraudScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">{getRiskBadge(claim.fraudScore)}</td>
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
        </Card>
      </div>
    </div>
  );
};

export default WorkerDashboard;
