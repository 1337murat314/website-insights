-- Restore update capability for table orders (needed for waiter marking as served)
-- Since staff auth is localStorage-based (not Supabase Auth), we need public update for now
-- This is a known limitation that requires server-side staff sessions to fully fix

CREATE POLICY "Anyone can update table order status" 
ON public.orders 
FOR UPDATE 
USING (table_number IS NOT NULL)
WITH CHECK (table_number IS NOT NULL);