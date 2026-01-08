-- Update verify_staff_login function to check branch
CREATE OR REPLACE FUNCTION public.verify_staff_login(
  staff_name text, 
  staff_code text, 
  staff_role text,
  staff_branch_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_record record;
BEGIN
  -- Find matching staff login
  SELECT sl.id, sl.name, sl.role, sl.branch_id, b.slug as branch_slug, b.name as branch_name
  INTO staff_record
  FROM public.staff_logins sl
  LEFT JOIN public.branches b ON b.id = sl.branch_id
  WHERE sl.name = staff_name
    AND sl.code = staff_code
    AND sl.role = staff_role
    AND sl.is_active = true
    AND (staff_branch_id IS NULL OR sl.branch_id = staff_branch_id);
  
  IF staff_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'id', staff_record.id,
    'name', staff_record.name,
    'role', staff_record.role,
    'branch_id', staff_record.branch_id,
    'branch_slug', staff_record.branch_slug,
    'branch_name', staff_record.branch_name
  );
END;
$$;

-- Also create a function that verifies by branch slug for the login pages
CREATE OR REPLACE FUNCTION public.verify_staff_login_by_slug(
  staff_name text, 
  staff_code text, 
  staff_role text,
  staff_branch_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_record record;
BEGIN
  -- Find matching staff login by branch slug
  SELECT sl.id, sl.name, sl.role, sl.branch_id, b.slug as branch_slug, b.name as branch_name
  INTO staff_record
  FROM public.staff_logins sl
  LEFT JOIN public.branches b ON b.id = sl.branch_id
  WHERE sl.name = staff_name
    AND sl.code = staff_code
    AND sl.role = staff_role
    AND sl.is_active = true
    AND (staff_branch_slug IS NULL OR b.slug = staff_branch_slug);
  
  IF staff_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'id', staff_record.id,
    'name', staff_record.name,
    'role', staff_record.role,
    'branch_id', staff_record.branch_id,
    'branch_slug', staff_record.branch_slug,
    'branch_name', staff_record.branch_name
  );
END;
$$;