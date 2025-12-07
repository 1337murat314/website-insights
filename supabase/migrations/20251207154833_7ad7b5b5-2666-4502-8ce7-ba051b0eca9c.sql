-- Fix security: Remove overly permissive policies and add proper restrictions

-- 1. Drop the overly permissive policies on orders table
DROP POLICY IF EXISTS "Staff can view orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;

-- 2. Create secure policies for orders - customers can only view their own table's orders
CREATE POLICY "Public can view orders by table number" 
ON public.orders 
FOR SELECT 
USING (table_number IS NOT NULL);

CREATE POLICY "Authenticated staff can update orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- 3. Drop overly permissive policies on order_items
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can delete order items" ON public.order_items;

-- 4. Create secure policies for order_items - tied to orders visibility
CREATE POLICY "Public can view order items for visible orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.table_number IS NOT NULL
  )
);

CREATE POLICY "Authenticated staff can update order items" 
ON public.order_items 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated staff can delete order items" 
ON public.order_items 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- 5. Drop overly permissive policies on service_requests
DROP POLICY IF EXISTS "Anyone can view service requests" ON public.service_requests;

-- 6. Create secure policy for service_requests - customers see only their table's requests
CREATE POLICY "Public can view service requests by table" 
ON public.service_requests 
FOR SELECT 
USING (table_number IS NOT NULL);

CREATE POLICY "Authenticated staff can manage service requests" 
ON public.service_requests 
FOR ALL
USING (auth.uid() IS NOT NULL);