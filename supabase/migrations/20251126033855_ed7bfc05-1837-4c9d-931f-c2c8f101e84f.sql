-- Add insurance company column to claims table
ALTER TABLE public.claims
ADD COLUMN insurance_company text;