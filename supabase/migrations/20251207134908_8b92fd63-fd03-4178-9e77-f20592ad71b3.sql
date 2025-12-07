-- Add policy for anyone to update orders (needed for waiter/kitchen staff who use code-based login)
CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Add policy for anyone to update order_items
CREATE POLICY "Anyone can update order items" 
ON public.order_items 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Add policy for anyone to delete order_items
CREATE POLICY "Anyone can delete order items" 
ON public.order_items 
FOR DELETE 
USING (true);

-- Add policy for anyone to update service_requests
CREATE POLICY "Anyone can update service requests" 
ON public.service_requests 
FOR UPDATE 
USING (true)
WITH CHECK (true);