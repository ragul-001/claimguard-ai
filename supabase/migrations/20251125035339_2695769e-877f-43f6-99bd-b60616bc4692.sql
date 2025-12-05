-- Create role enum
CREATE TYPE public.app_role AS ENUM ('policy_holder', 'insurance_worker');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_holder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  claim_amount DECIMAL(12,2) NOT NULL,
  policy_number TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  admission_date DATE NOT NULL,
  doctor_name TEXT NOT NULL,
  account_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  fraud_prediction INTEGER,
  fraud_probability DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Claims RLS policies
-- Policy holders can view their own claims
CREATE POLICY "Policy holders can view own claims"
  ON public.claims FOR SELECT
  USING (
    auth.uid() = policy_holder_id 
    AND public.has_role(auth.uid(), 'policy_holder')
  );

-- Policy holders can insert their own claims
CREATE POLICY "Policy holders can create claims"
  ON public.claims FOR INSERT
  WITH CHECK (
    auth.uid() = policy_holder_id 
    AND public.has_role(auth.uid(), 'policy_holder')
  );

-- Insurance workers can view all claims
CREATE POLICY "Insurance workers can view all claims"
  ON public.claims FOR SELECT
  USING (public.has_role(auth.uid(), 'insurance_worker'));

-- Insurance workers can update claims
CREATE POLICY "Insurance workers can update claims"
  ON public.claims FOR UPDATE
  USING (public.has_role(auth.uid(), 'insurance_worker'));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();