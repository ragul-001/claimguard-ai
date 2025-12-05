import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    diagnosis: "",
    billAmount: "",
    stayDuration: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.patientName && formData.billAmount && files.length > 0) {
      toast.success("Claim submitted successfully!");
      navigate("/policy-holder/success");
    } else {
      toast.error("Please fill all required fields and upload documents");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-primary/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Submit Insurance Claim
          </h1>
          <p className="text-muted-foreground">Fill in your claim details below</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      placeholder="Enter patient name"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData({ ...formData, patientName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name *</Label>
                    <Input
                      id="hospitalName"
                      placeholder="Enter hospital name"
                      value={formData.hospitalName}
                      onChange={(e) =>
                        setFormData({ ...formData, hospitalName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billAmount">Bill Amount (₹) *</Label>
                    <Input
                      id="billAmount"
                      type="number"
                      placeholder="45000"
                      value={formData.billAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, billAmount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stayDuration">Stay Duration (days)</Label>
                    <Input
                      id="stayDuration"
                      type="number"
                      placeholder="3"
                      value={formData.stayDuration}
                      onChange={(e) =>
                        setFormData({ ...formData, stayDuration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Documents *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-foreground font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Medical bills, prescriptions, discharge summary
                      </p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-foreground bg-muted p-2 rounded"
                        >
                          <FileText className="w-4 h-4" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  Submit Claim
                </Button>
              </form>
            </Card>
          </div>

          {/* Help Card */}
          <div className="md:col-span-1">
            <Card className="p-6 bg-primary border-primary sticky top-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary-foreground mb-1">
                      Required Documents
                    </h3>
                    <p className="text-sm text-primary-foreground/80">
                      Medical bills, prescriptions, and discharge summary
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary-foreground mb-1">
                      Processing Time
                    </h3>
                    <p className="text-sm text-primary-foreground/80">
                      Claims are reviewed within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary-foreground mb-1">
                      AI Verification
                    </h3>
                    <p className="text-sm text-primary-foreground/80">
                      Advanced fraud detection ensures fair processing
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitClaim;
