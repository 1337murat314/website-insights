-- Create catering leads table to track quote requests
CREATE TABLE public.catering_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date DATE,
  event_type TEXT,
  guest_count INTEGER,
  notes TEXT,
  selected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catering_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can create leads (for quote requests)
CREATE POLICY "Anyone can create catering leads"
ON public.catering_leads
FOR INSERT
WITH CHECK (true);

-- Admins can manage all leads
CREATE POLICY "Admins can manage catering leads"
ON public.catering_leads
FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_catering_leads_updated_at
BEFORE UPDATE ON public.catering_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();