-- Add new columns to claims table
ALTER TABLE public.claims
ADD COLUMN discharge_date date,
ADD COLUMN patient_name text NOT NULL DEFAULT '',
ADD COLUMN patient_age integer,
ADD COLUMN patient_id_proof_url text,
ADD COLUMN diagnosis text,
ADD COLUMN treatment_type text,
ADD COLUMN stay_duration integer,
ADD COLUMN ifsc_code text,
ADD COLUMN hospital_bill_url text,
ADD COLUMN discharge_summary_url text,
ADD COLUMN doctor_prescription_url text,
ADD COLUMN diagnostic_reports_urls text[], -- Array for multiple diagnostic reports
ADD COLUMN pharmacy_bills_urls text[]; -- Array for multiple pharmacy bills

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('claim-documents', 'claim-documents', false);

-- Storage policies for claim documents
CREATE POLICY "Users can upload their own claim documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'claim-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own claim documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'claim-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Insurance workers can view all claim documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'claim-documents' 
  AND has_role(auth.uid(), 'insurance_worker'::app_role)
);

-- Function to calculate stay duration
CREATE OR REPLACE FUNCTION calculate_stay_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discharge_date IS NOT NULL AND NEW.admission_date IS NOT NULL THEN
    NEW.stay_duration := NEW.discharge_date - NEW.admission_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate stay duration
CREATE TRIGGER set_stay_duration
BEFORE INSERT OR UPDATE ON public.claims
FOR EACH ROW
EXECUTE FUNCTION calculate_stay_duration();