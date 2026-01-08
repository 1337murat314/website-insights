-- Drop the existing role check constraint
ALTER TABLE public.staff_logins DROP CONSTRAINT staff_logins_role_check;

-- Add the new constraint that includes branch_admin
ALTER TABLE public.staff_logins 
ADD CONSTRAINT staff_logins_role_check 
CHECK (role = ANY (ARRAY['kitchen'::text, 'waiter'::text, 'branch_admin'::text]));