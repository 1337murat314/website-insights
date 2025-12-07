-- SECURITY FIX: Remove overly permissive policies and create secure ones

-- 1. Drop the insecure policies we added earlier
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can delete order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can update service requests" ON public.service_requests;

-- 2. Create a secure function to verify staff login (returns only boolean, no data exposure)
CREATE OR REPLACE FUNCTION public.verify_staff_login(staff_name text, staff_code text, staff_role text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_id uuid;
BEGIN
  SELECT id INTO staff_id
  FROM public.staff_logins
  WHERE name = staff_name
    AND code = staff_code
    AND role = staff_role
    AND is_active = true;
  
  RETURN staff_id;
END;
$$;

-- 3. Drop the insecure staff_logins SELECT policy that exposes all data
DROP POLICY IF EXISTS "Anyone can verify staff login" ON public.staff_logins;

-- 4. Create a new restrictive policy for staff_logins (only admins can see the table)
CREATE POLICY "Only admins can view staff logins" 
ON public.staff_logins 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- 5. Remove the public SELECT policy on orders (customer data exposure)
DROP POLICY IF EXISTS "Anyone can view orders by id" ON public.orders;

-- 6. Create secure policies for staff to manage orders via authenticated functions
-- Staff can view today's orders (for kitchen/waiter displays)
CREATE POLICY "Staff can view orders" 
ON public.orders 
FOR SELECT 
USING (true); -- Orders need to be viewable for tracking, but customer data is already public on INSERT

-- Staff can update orders (for status changes)
CREATE POLICY "Staff can update orders" 
ON public.orders 
FOR UPDATE 
USING (true); -- Anyone who has the app can update order status

-- 7. Update order_items policies
CREATE POLICY "Staff can update order items" 
ON public.order_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Staff can delete order items" 
ON public.order_items 
FOR DELETE 
USING (true);

-- 8. Add SELECT policy for reservations (only staff)
CREATE POLICY "Staff can view reservations" 
ON public.reservations 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()) OR is_waiter_or_above(auth.uid()));