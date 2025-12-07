-- Create table for staff logins (kitchen and waiter)
CREATE TABLE public.staff_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (length(code) = 6 AND code ~ '^[0-9]+$'),
  role TEXT NOT NULL CHECK (role IN ('kitchen', 'waiter')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(code)
);

-- Enable RLS
ALTER TABLE public.staff_logins ENABLE ROW LEVEL SECURITY;

-- Admins can manage staff logins
CREATE POLICY "Admins can manage staff logins"
ON public.staff_logins
FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Anyone can verify login (for login check)
CREATE POLICY "Anyone can verify staff login"
ON public.staff_logins
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_staff_logins_updated_at
  BEFORE UPDATE ON public.staff_logins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();