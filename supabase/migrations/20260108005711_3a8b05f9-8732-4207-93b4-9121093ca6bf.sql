-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_tr TEXT,
  address TEXT,
  phone TEXT,
  hours TEXT,
  map_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Anyone can view active branches
CREATE POLICY "Anyone can view active branches" ON public.branches
  FOR SELECT USING (is_active = true);

-- Admins can manage branches
CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- Create menu_item_sizes table for pizza and other items with size options
CREATE TABLE public.menu_item_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_tr TEXT,
  price_adjustment NUMERIC DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_item_sizes ENABLE ROW LEVEL SECURITY;

-- Anyone can view sizes
CREATE POLICY "Anyone can view sizes" ON public.menu_item_sizes
  FOR SELECT USING (true);

-- Admins can manage sizes
CREATE POLICY "Admins can manage sizes" ON public.menu_item_sizes
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- Create branch_menu_items junction table for branch-specific availability
CREATE TABLE public.branch_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  price_override NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, menu_item_id)
);

-- Enable RLS
ALTER TABLE public.branch_menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view branch menu items
CREATE POLICY "Anyone can view branch menu items" ON public.branch_menu_items
  FOR SELECT USING (true);

-- Admins can manage branch menu items
CREATE POLICY "Admins can manage branch menu items" ON public.branch_menu_items
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- Add has_sizes flag to menu_items to indicate if item has size options
ALTER TABLE public.menu_items ADD COLUMN has_sizes BOOLEAN DEFAULT false;

-- Add trigger for updated_at on branches
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on branch_menu_items
CREATE TRIGGER update_branch_menu_items_updated_at
  BEFORE UPDATE ON public.branch_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default branches from constants
INSERT INTO public.branches (name, name_tr, address, phone, hours, map_url, sort_order) VALUES
('Lefkoşa', 'Lefkoşa', 'Mehmet Akif Caddesi, Lefkoşa', '+90 392 444 7070', '09:00 - 00:00', 'https://maps.google.com/?q=Califorian+Lefkosa', 1),
('Gazimağusa', 'Gazimağusa', 'Gazimağusa', '+90 392 444 7070', '09:00 - 00:00', 'https://maps.google.com/?q=Califorian+Gazimagusa', 2),
('Esentepe', 'Esentepe', 'Esentepe', '+90 392 444 7070', '09:00 - 00:00', 'https://maps.google.com/?q=Califorian+Esentepe', 3);