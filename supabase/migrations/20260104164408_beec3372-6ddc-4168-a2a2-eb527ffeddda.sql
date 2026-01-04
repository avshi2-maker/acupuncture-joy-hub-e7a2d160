-- Create clinic_wallets table for prepaid credits
CREATE TABLE public.clinic_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  last_top_up_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_wallets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wallet
CREATE POLICY "Users can view their own wallet"
  ON public.clinic_wallets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own wallet (for credit deductions)
CREATE POLICY "Users can update their own wallet"
  ON public.clinic_wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow insert for users to create their own wallet
CREATE POLICY "Users can create their own wallet"
  ON public.clinic_wallets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create credit_transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'refund', 'reset')),
  description TEXT,
  balance_after INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert transactions (via service role)
CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create credit_packs table for available packages
CREATE TABLE public.credit_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_he TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_ils INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - packs are public read
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active credit packs"
  ON public.credit_packs
  FOR SELECT
  USING (is_active = true);

-- Create trigger to update updated_at
CREATE TRIGGER update_clinic_wallets_updated_at
  BEFORE UPDATE ON public.clinic_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default credit packs
INSERT INTO public.credit_packs (name, name_he, credits, price_ils, description, sort_order) VALUES
  ('Starter Pack', 'חבילת התחלה', 500, 0, 'Included with subscription', 1),
  ('Booster Pack', 'חבילת שדרוג', 500, 49, 'One-time credit top-up', 2),
  ('Pro Pack', 'חבילת מקצוען', 1200, 99, 'Full month coverage', 3),
  ('Clinic Pack', 'חבילת מרפאה', 3000, 199, 'High-volume clinics', 4);