-- Drop existing policies if they exist before recreating
DROP POLICY IF EXISTS "Admins can view settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Admins can view guests" ON public.guests;

-- Add explicit SELECT policy for restaurant_settings (admin only)
CREATE POLICY "Admins can view settings" 
ON public.restaurant_settings 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- Add explicit SELECT policy for guests (admin only for defense in depth)
CREATE POLICY "Admins can view guests" 
ON public.guests 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));