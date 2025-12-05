-- Fix function search path for calculate_stay_duration
CREATE OR REPLACE FUNCTION calculate_stay_duration()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.discharge_date IS NOT NULL AND NEW.admission_date IS NOT NULL THEN
    NEW.stay_duration := NEW.discharge_date - NEW.admission_date;
  END IF;
  RETURN NEW;
END;
$$;