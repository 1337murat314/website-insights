-- Drop the existing check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated check constraint with 'served' status
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'customer_cancelled', 'kitchen_cancelled', 'out_of_stock', 'refunded', 'modified'));