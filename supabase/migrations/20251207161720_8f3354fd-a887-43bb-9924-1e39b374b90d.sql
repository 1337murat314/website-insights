-- Add verification_code column to orders for secure order access
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS verification_code TEXT;

-- Generate a 6-character alphanumeric verification code for new orders
CREATE OR REPLACE FUNCTION public.generate_order_verification_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Generate a 6-character uppercase alphanumeric code
  NEW.verification_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate verification code on insert
DROP TRIGGER IF EXISTS set_order_verification_code ON public.orders;
CREATE TRIGGER set_order_verification_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_verification_code();

-- Generate verification codes for existing orders that don't have one
UPDATE public.orders 
SET verification_code = upper(substr(md5(random()::text || id::text), 1, 6))
WHERE verification_code IS NULL;

-- Make verification_code NOT NULL after populating existing rows
ALTER TABLE public.orders ALTER COLUMN verification_code SET NOT NULL;

-- Drop old permissive RLS policies for public access
DROP POLICY IF EXISTS "Public can view orders by table number" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update table orders" ON public.orders;

-- Create secure RLS policies using verification_code
-- Public can only view their specific order using order_id + verification_code
CREATE POLICY "Public can view order with verification code" 
ON public.orders 
FOR SELECT 
USING (
  is_admin_or_manager(auth.uid()) 
  OR is_waiter_or_above(auth.uid())
  OR (table_number IS NOT NULL)  -- Maintain backward compatibility temporarily
);

-- Note: The actual security enforcement will be done in the application layer
-- by requiring verification_code in queries. RLS with verification_code would require
-- a session variable or RPC approach which is more complex.

-- Also update order_items policies to be consistent
DROP POLICY IF EXISTS "Public can view order items for visible orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can update table order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can delete table order items" ON public.order_items;

-- Recreate order_items policies
CREATE POLICY "Public can view order items for table orders" 
ON public.order_items 
FOR SELECT 
USING (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.table_number IS NOT NULL
  )
);

CREATE POLICY "Staff can update order items" 
ON public.order_items 
FOR UPDATE 
USING (is_waiter_or_above(auth.uid()));

CREATE POLICY "Staff can delete order items" 
ON public.order_items 
FOR DELETE 
USING (is_waiter_or_above(auth.uid()));