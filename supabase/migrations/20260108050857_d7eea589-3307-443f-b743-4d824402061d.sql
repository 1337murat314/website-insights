-- Add slug column to branches for URL routing
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Update existing branches with slugs
UPDATE public.branches SET slug = 'lefkosa' WHERE name ILIKE '%lefko%' OR name ILIKE '%nicosia%';
UPDATE public.branches SET slug = 'gazimagusa' WHERE name ILIKE '%magusa%' OR name ILIKE '%famagusta%';
UPDATE public.branches SET slug = 'esentepe' WHERE name ILIKE '%esentepe%';

-- Insert branches if they don't exist
INSERT INTO public.branches (name, name_tr, slug, address, phone, is_active, sort_order)
VALUES 
  ('Lefkoşa', 'Lefkoşa', 'lefkosa', 'Lefkoşa Merkez', '+90 392 XXX XXXX', true, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.branches (name, name_tr, slug, address, phone, is_active, sort_order)
VALUES 
  ('Gazimağusa', 'Gazimağusa', 'gazimagusa', 'Gazimağusa Merkez', '+90 392 XXX XXXX', true, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.branches (name, name_tr, slug, address, phone, is_active, sort_order)
VALUES 
  ('Esentepe', 'Esentepe', 'esentepe', 'Esentepe Sahil', '+90 392 XXX XXXX', true, 3)
ON CONFLICT (slug) DO NOTHING;