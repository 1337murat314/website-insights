-- Create modifier groups for menu items (e.g., "Spice Level", "Add-ons")
CREATE TABLE public.modifier_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_tr text,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  min_selections integer DEFAULT 0,
  max_selections integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create modifiers (e.g., "Extra Cheese", "No Onions")
CREATE TABLE public.modifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_group_id uuid REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_tr text,
  price_adjustment numeric DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number serial,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  order_type text NOT NULL CHECK (order_type IN ('dine-in', 'pickup', 'delivery')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash_at_table', 'card_at_table')),
  table_number text,
  delivery_address text,
  delivery_notes text,
  pickup_time timestamp with time zone,
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'in_progress', 'ready', 'completed', 'cancelled')),
  estimated_prep_time integer, -- in minutes
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  item_name_tr text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  modifiers jsonb DEFAULT '[]'::jsonb,
  special_instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Modifier groups policies
CREATE POLICY "Anyone can view modifier groups" ON public.modifier_groups FOR SELECT USING (true);
CREATE POLICY "Admins can manage modifier groups" ON public.modifier_groups FOR ALL USING (is_admin_or_manager(auth.uid()));

-- Modifiers policies
CREATE POLICY "Anyone can view available modifiers" ON public.modifiers FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage modifiers" ON public.modifiers FOR ALL USING (is_admin_or_manager(auth.uid()));

-- Orders policies
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Customers can view their orders by phone" ON public.orders FOR SELECT USING (true);

-- Order items policies
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();