
-- Create guests table for CRM
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT NOT NULL,
  vip_status BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  birthday DATE,
  anniversary DATE,
  dietary_restrictions TEXT[],
  seating_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_spend NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special_events table
CREATE TABLE public.special_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_tr TEXT,
  description TEXT,
  description_tr TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  image_url TEXT,
  capacity INTEGER,
  price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guests
CREATE POLICY "Admins can manage guests" ON public.guests
FOR ALL USING (is_admin_or_manager(auth.uid()));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for promo_codes
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
FOR ALL USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for special_events
CREATE POLICY "Admins can manage events" ON public.special_events
FOR ALL USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Anyone can view active events" ON public.special_events
FOR SELECT USING (is_active = true);

-- Add guest_id to reservations for CRM linking
ALTER TABLE public.reservations ADD COLUMN guest_id UUID REFERENCES public.guests(id);

-- Create triggers for updated_at
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_events_updated_at BEFORE UPDATE ON public.special_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
