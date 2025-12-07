-- Create table for service requests (call waiter, request bill)
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('call_waiter', 'request_bill')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'completed')),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create service requests (customers at tables)
CREATE POLICY "Anyone can create service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (true);

-- Anyone can view service requests (for tracking page)
CREATE POLICY "Anyone can view service requests" 
ON public.service_requests 
FOR SELECT 
USING (true);

-- Admins/waiters can manage service requests
CREATE POLICY "Staff can manage service requests" 
ON public.service_requests 
FOR ALL 
USING (is_waiter_or_above(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;

-- Create trigger for updated_at
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();