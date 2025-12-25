-- Create enums for roles and subscription tiers
CREATE TYPE public.app_role AS ENUM ('admin', 'therapist', 'patient');
CREATE TYPE public.subscription_tier AS ENUM ('trial', 'standard', 'premium');
CREATE TYPE public.registration_status AS ENUM ('pending', 'trial', 'active', 'expired');

-- Create therapist_registrations table
CREATE TABLE public.therapist_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  requested_tier subscription_tier NOT NULL DEFAULT 'trial',
  status registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create access_passwords table (managed by Dr. Roni)
CREATE TABLE public.access_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  plain_password TEXT NOT NULL, -- For Dr. Roni to copy/share
  therapist_registration_id UUID REFERENCES public.therapist_registrations(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'trial',
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user_roles table (security definer pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create access_logs table
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.therapist_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for therapist_registrations
-- Anyone can insert (public registration)
CREATE POLICY "Anyone can register as therapist"
ON public.therapist_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view all registrations
CREATE POLICY "Admins can view all registrations"
ON public.therapist_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update registrations
CREATE POLICY "Admins can update registrations"
ON public.therapist_registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for access_passwords
-- Only admins can manage passwords
CREATE POLICY "Admins can manage passwords"
ON public.access_passwords
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can validate a password (for login gate)
CREATE POLICY "Anyone can validate password"
ON public.access_passwords
FOR SELECT
TO anon, authenticated
USING (true);

-- RLS Policies for user_roles
-- Users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for access_logs
-- Only admins can view logs
CREATE POLICY "Admins can view logs"
ON public.access_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert logs
CREATE POLICY "Anyone can create logs"
ON public.access_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to therapist_registrations
CREATE TRIGGER update_therapist_registrations_updated_at
BEFORE UPDATE ON public.therapist_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();