-- Ensure admins can SELECT all orders (the ALL policy might not apply to SELECT in some cases)
-- Add explicit SELECT policy for admins
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- Also add explicit SELECT policy for order_items for admins
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));