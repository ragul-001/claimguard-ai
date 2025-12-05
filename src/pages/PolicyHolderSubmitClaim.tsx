import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { detectInsuranceCompany, type InsuranceCompany } from "@/lib/insuranceCompanyDetector";

const claimSchema = z.object({
  // Policy Information
  claimAmount: z.number().positive("Amount must be positive").max(10000000, "Amount too large"),
  policyNumber: z.string().trim().min(1, "Policy number is required").max(50),
  admissionDate: z.string().min(1, "Admission date is required"),
  dischargeDate: z.string().min(1, "Discharge date is required"),
  hospitalName: z.string().trim().min(1, "Hospital name is required").max(200),
  
  // Patient Information
  patientName: z.string().trim().min(1, "Patient name is required").max(200),
  patientAge: z.number().int().positive("Age must be positive").max(150, "Invalid age"),
  
  // Medical Information
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(500),
  treatmentType: z.string().trim().min(1, "Treatment type is required").max(200),
  doctorName: z.string().trim().min(1, "Doctor name is required").max(200),
  
  // Bank Details
  accountNumber: z.string().trim().optional(),
  ifscCode: z.string().trim().optional(),
  
  notes: z.string().max(1000, "Notes too long").optional(),
});

const PolicyHolderSubmitClaim = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Policy Information
  const [claimAmount, setClaimAmount] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [detectedCompany, setDetectedCompany] = useState<InsuranceCompany>(null);
  const [policyNumberError, setPolicyNumberError] = useState<string>("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  
  // Patient Information
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  
  // Medical Information
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  // Bank Details
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  
  const [notes, setNotes] = useState("");
  
  // Document uploads
  const [patientIdProof, setPatientIdProof] = useState<File | null>(null);
  const [hospitalBill, setHospitalBill] = useState<File | null>(null);
  const [dischargeSummary, setDischargeSummary] = useState<File | null>(null);
  const [doctorPrescription, setDoctorPrescription] = useState<File | null>(null);
  const [diagnosticReports, setDiagnosticReports] = useState<File[]>([]);
  const [pharmacyBills, setPharmacyBills] = useState<File[]>([]);

  // Real-time insurance company detection
  useEffect(() => {
    if (policyNumber.trim() === "") {
      setDetectedCompany(null);
      setPolicyNumberError("");
      return;
    }

    const result = detectInsuranceCompany(policyNumber);
    
    if (result.isValid && result.company) {
      setDetectedCompany(result.company);
      setPolicyNumberError("");
    } else {
      setDetectedCompany(null);
      setPolicyNumberError(result.errorMessage || "Invalid policy number format.");
    }
  }, [policyNumber]);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("claim-documents")
      .upload(`${user?.id}/${path}`, file, {
        upsert: true,
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from("claim-documents")
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = claimSchema.parse({
        claimAmount: parseFloat(claimAmount),
        policyNumber,
        admissionDate,
        dischargeDate,
        hospitalName,
        patientName,
        patientAge: parseInt(patientAge),
        diagnosis,
        treatmentType,
        doctorName,
        accountNumber: accountNumber || undefined,
        ifscCode: ifscCode || undefined,
        notes: notes || undefined,
      });

      setLoading(true);

      // Upload documents
      let patientIdProofUrl = null;
      let hospitalBillUrl = null;
      let dischargeSummaryUrl = null;
      let doctorPrescriptionUrl = null;
      const diagnosticReportsUrls: string[] = [];
      const pharmacyBillsUrls: string[] = [];

      if (patientIdProof) {
        patientIdProofUrl = await uploadFile(patientIdProof, `id-proof-${Date.now()}-${patientIdProof.name}`);
      }
      if (hospitalBill) {
        hospitalBillUrl = await uploadFile(hospitalBill, `hospital-bill-${Date.now()}-${hospitalBill.name}`);
      }
      if (dischargeSummary) {
        dischargeSummaryUrl = await uploadFile(dischargeSummary, `discharge-summary-${Date.now()}-${dischargeSummary.name}`);
      }
      if (doctorPrescription) {
        doctorPrescriptionUrl = await uploadFile(doctorPrescription, `prescription-${Date.now()}-${doctorPrescription.name}`);
      }
      
      for (const report of diagnosticReports) {
        const url = await uploadFile(report, `diagnostic-report-${Date.now()}-${report.name}`);
        diagnosticReportsUrls.push(url);
      }
      
      for (const bill of pharmacyBills) {
        const url = await uploadFile(bill, `pharmacy-bill-${Date.now()}-${bill.name}`);
        pharmacyBillsUrls.push(url);
      }

      // Validate insurance company is detected
      if (!detectedCompany) {
        toast.error("Please enter a valid policy number");
        return;
      }

      const { error } = await supabase.from("claims").insert({
        policy_holder_id: user?.id,
        claim_amount: validated.claimAmount,
        policy_number: validated.policyNumber,
        insurance_company: detectedCompany,
        admission_date: validated.admissionDate,
        discharge_date: validated.dischargeDate,
        hospital_name: validated.hospitalName,
        patient_name: validated.patientName,
        patient_age: validated.patientAge,
        patient_id_proof_url: patientIdProofUrl,
        diagnosis: validated.diagnosis,
        treatment_type: validated.treatmentType,
        doctor_name: validated.doctorName,
        account_number: validated.accountNumber || null,
        ifsc_code: validated.ifscCode || null,
        hospital_bill_url: hospitalBillUrl,
        discharge_summary_url: dischargeSummaryUrl,
        doctor_prescription_url: doctorPrescriptionUrl,
        diagnostic_reports_urls: diagnosticReportsUrls.length > 0 ? diagnosticReportsUrls : null,
        pharmacy_bills_urls: pharmacyBillsUrls.length > 0 ? pharmacyBillsUrls : null,
        notes: validated.notes || null,
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/policy-holder/dashboard");
      }, 2000);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to submit claim");
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-risk-genuine/20 p-4">
              <CheckCircle2 className="w-16 h-16 text-risk-genuine animate-scale-in" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Claim Submitted Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your claim has been submitted and is now under review.
          </p>
          <Button onClick={() => navigate("/policy-holder/dashboard")} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Submit New Claim</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Policy Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    required
                    maxLength={50}
                    className={policyNumberError ? "border-destructive" : detectedCompany ? "border-green-500" : ""}
                  />
                  {detectedCompany && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Detected insurance company: {detectedCompany}
                    </p>
                  )}
                  {policyNumberError && (
                    <p className="text-sm text-destructive mt-1">
                      {policyNumberError}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="claimAmount">Claim Amount (₹)</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admissionDate">Date of Admission</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dischargeDate">Date of Discharge</Label>
                  <Input
                    id="dischargeDate"
                    type="date"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Patient Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="patientAge">Age</Label>
                  <Input
                    id="patientAge"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    required
                    min="0"
                    max="150"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="patientIdProof">ID Proof (Upload)</Label>
                <Input
                  id="patientIdProof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPatientIdProof(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Medical Information</h3>
              
              <div>
                <Label htmlFor="diagnosis">Diagnosis / Reason for Admission</Label>
                <Textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatmentType">Treatment Type</Label>
                  <Input
                    id="treatmentType"
                    value={treatmentType}
                    onChange={(e) => setTreatmentType(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input
                    id="doctorName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Bank Details (For Reimbursement)</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number (Optional)</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code (Optional)</Label>
                  <Input
                    id="ifscCode"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Document Uploads</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospitalBill">Hospital Bill</Label>
                  <Input
                    id="hospitalBill"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setHospitalBill(e.target.files?.[0] || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="dischargeSummary">Discharge Summary</Label>
                  <Input
                    id="dischargeSummary"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDischargeSummary(e.target.files?.[0] || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="doctorPrescription">Doctor Prescription</Label>
                  <Input
                    id="doctorPrescription"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDoctorPrescription(e.target.files?.[0] || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosticReports">Diagnostic Reports (Multiple)</Label>
                  <Input
                    id="diagnosticReports"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => setDiagnosticReports(Array.from(e.target.files || []))}
                  />
                </div>

                <div>
                  <Label htmlFor="pharmacyBills">Pharmacy Bills (Multiple)</Label>
                  <Input
                    id="pharmacyBills"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => setPharmacyBills(Array.from(e.target.files || []))}
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Any additional information about the claim..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Claim"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-secondary/50 h-fit">
          <h3 className="font-semibold text-foreground mb-4">Claim Requirements</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Valid policy number</li>
            <li>✓ Complete patient information</li>
            <li>✓ Accurate admission & discharge dates</li>
            <li>✓ Doctor and hospital details</li>
            <li>✓ Medical diagnosis and treatment info</li>
            <li>✓ All required documents uploaded</li>
          </ul>
          
          <div className="mt-6">
            <h4 className="font-semibold text-foreground text-sm mb-2">Required Documents</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Hospital Bill</li>
              <li>• Discharge Summary</li>
              <li>• Doctor Prescription</li>
              <li>• Diagnostic Reports</li>
              <li>• Pharmacy Bills</li>
              <li>• Patient ID Proof</li>
            </ul>
          </div>
          
          <p className="mt-4 text-xs text-muted-foreground">
            All claims are reviewed by our insurance workers and verified using AI-powered fraud detection.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PolicyHolderSubmitClaim;
