-- Add branch_id to staff_logins if not exists
ALTER TABLE public.staff_logins ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);

-- Add branch_id to orders if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);

-- Add branch_id to reservations if not exists  
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);

-- Add branch_id to restaurant_tables if not exists
ALTER TABLE public.restaurant_tables ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);

-- Add branch_id to service_requests if not exists
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);

-- Fix slug for the duplicate Gazimağusa (set null slug one)
UPDATE public.branches SET slug = NULL WHERE id = '825f0a48-396b-477d-a1d1-f12eb36b011f';

-- Delete the duplicate branch without slug
DELETE FROM public.branches WHERE id = '825f0a48-396b-477d-a1d1-f12eb36b011f';

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_staff_logins_branch_id ON public.staff_logins(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON public.orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_reservations_branch_id ON public.reservations(branch_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_branch_id ON public.restaurant_tables(branch_id);