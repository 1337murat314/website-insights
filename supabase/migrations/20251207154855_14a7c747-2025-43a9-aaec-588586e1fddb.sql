-- Fix RLS policies to allow public access for waiter/kitchen staff operations
-- Staff uses localStorage session, not Supabase Auth

-- Drop the authenticated-only update policies
DROP POLICY IF EXISTS "Authenticated staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated staff can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated staff can delete order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated staff can manage service requests" ON public.service_requests;

-- Create policies that allow updates for dine-in orders (table orders only)
-- This is secure because: only table-based orders can be modified, not delivery/pickup orders with customer data

CREATE POLICY "Anyone can update table orders" 
ON public.orders 
FOR UPDATE 
USING (table_number IS NOT NULL);

CREATE POLICY "Anyone can update table order items" 
ON public.order_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.table_number IS NOT NULL
  )
);

CREATE POLICY "Anyone can delete table order items" 
ON public.order_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.table_number IS NOT NULL
  )
);

CREATE POLICY "Anyone can update service requests" 
ON public.service_requests 
FOR UPDATE 
USING (table_number IS NOT NULL);

CREATE POLICY "Anyone can delete service requests" 
ON public.service_requests 
FOR DELETE 
USING (table_number IS NOT NULL);