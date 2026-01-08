-- Create catering products table
CREATE TABLE public.catering_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_tr TEXT,
  description TEXT,
  description_tr TEXT,
  category TEXT NOT NULL,
  category_tr TEXT,
  unit TEXT NOT NULL DEFAULT 'adet', -- adet, kg, porsiyon, etc.
  unit_tr TEXT,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catering_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view available catering products
CREATE POLICY "Anyone can view available catering products"
ON public.catering_products
FOR SELECT
USING (is_available = true);

-- Admins can manage catering products
CREATE POLICY "Admins can manage catering products"
ON public.catering_products
FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_catering_products_updated_at
BEFORE UPDATE ON public.catering_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock data for testing
INSERT INTO public.catering_products (name, name_tr, description, description_tr, category, category_tr, unit, unit_tr, price_per_unit, min_quantity, sort_order) VALUES
-- Main Dishes
('Grilled Mediterranean Chicken', 'Izgara Akdeniz Tavuğu', 'Herb-marinated grilled chicken with Mediterranean spices', 'Akdeniz baharatlarıyla marine edilmiş ızgara tavuk', 'Main Dishes', 'Ana Yemekler', 'person', 'kişi', 85, 10, 1),
('Lamb Kofta Platter', 'Kuzu Köfte Tabağı', 'Traditional lamb kofta served with rice and salad', 'Pilav ve salata ile servis edilen geleneksel kuzu köfte', 'Main Dishes', 'Ana Yemekler', 'person', 'kişi', 95, 10, 2),
('Mixed Grill Selection', 'Karışık Izgara Seçkisi', 'Assorted grilled meats with vegetables', 'Sebzelerle servis edilen çeşitli ızgara etler', 'Main Dishes', 'Ana Yemekler', 'person', 'kişi', 120, 10, 3),
('Sea Bass Fillet', 'Levrek Fileto', 'Fresh sea bass with lemon butter sauce', 'Limonlu tereyağ soslu taze levrek', 'Main Dishes', 'Ana Yemekler', 'person', 'kişi', 110, 10, 4),
('Vegetarian Moussaka', 'Vejetaryen Musakka', 'Layered eggplant with vegetables and cheese', 'Sebzeli ve peynirli katmanlı patlıcan', 'Main Dishes', 'Ana Yemekler', 'person', 'kişi', 75, 10, 5),

-- Appetizers
('Hummus & Pita', 'Humus & Pide', 'Creamy hummus with fresh pita bread', 'Taze pide ekmekli kremalı humus', 'Appetizers', 'Mezeler', 'kg', 'kg', 120, 1, 10),
('Stuffed Vine Leaves', 'Yaprak Sarma', 'Rice-stuffed vine leaves with herbs', 'Otlu pirinç dolgulu yaprak sarma', 'Appetizers', 'Mezeler', 'kg', 'kg', 150, 1, 11),
('Meze Platter', 'Meze Tabağı', 'Assorted Mediterranean appetizers', 'Çeşitli Akdeniz mezeleri', 'Appetizers', 'Mezeler', 'person', 'kişi', 45, 10, 12),
('Falafel Bites', 'Falafel', 'Crispy falafel with tahini sauce', 'Tahin soslu çıtır falafel', 'Appetizers', 'Mezeler', 'portion', 'porsiyon', 35, 5, 13),
('Grilled Halloumi', 'Izgara Hellim', 'Grilled halloumi cheese with herbs', 'Otlu ızgara hellim peyniri', 'Appetizers', 'Mezeler', 'kg', 'kg', 180, 1, 14),

-- Salads
('Greek Salad', 'Yunan Salatası', 'Fresh vegetables with feta cheese', 'Beyaz peynirli taze sebzeler', 'Salads', 'Salatalar', 'person', 'kişi', 35, 10, 20),
('Mediterranean Quinoa Salad', 'Akdeniz Kinoa Salatası', 'Quinoa with vegetables and lemon dressing', 'Sebzeli ve limonlu kinoa salatası', 'Salads', 'Salatalar', 'person', 'kişi', 40, 10, 21),
('Fattoush Salad', 'Fattuş Salatası', 'Lebanese bread salad with sumac', 'Sumak ile Lübnan ekmek salatası', 'Salads', 'Salatalar', 'person', 'kişi', 35, 10, 22),

-- Desserts
('Baklava Selection', 'Baklava Çeşitleri', 'Assorted traditional baklava', 'Çeşitli geleneksel baklava', 'Desserts', 'Tatlılar', 'kg', 'kg', 200, 1, 30),
('Turkish Delight', 'Lokum', 'Assorted Turkish delight flavors', 'Çeşitli lokum lezzetleri', 'Desserts', 'Tatlılar', 'kg', 'kg', 150, 1, 31),
('Kunefe', 'Künefe', 'Traditional cheese dessert with syrup', 'Şerbetli geleneksel peynirli tatlı', 'Desserts', 'Tatlılar', 'portion', 'porsiyon', 45, 10, 32),
('Fresh Fruit Platter', 'Taze Meyve Tabağı', 'Seasonal fresh fruits', 'Mevsim taze meyveleri', 'Desserts', 'Tatlılar', 'person', 'kişi', 30, 10, 33),

-- Beverages
('Turkish Tea Service', 'Türk Çayı Servisi', 'Traditional Turkish tea', 'Geleneksel Türk çayı', 'Beverages', 'İçecekler', 'person', 'kişi', 15, 10, 40),
('Turkish Coffee', 'Türk Kahvesi', 'Traditional Turkish coffee', 'Geleneksel Türk kahvesi', 'Beverages', 'İçecekler', 'person', 'kişi', 20, 10, 41),
('Fresh Lemonade', 'Taze Limonata', 'Homemade fresh lemonade', 'Ev yapımı taze limonata', 'Beverages', 'İçecekler', 'liter', 'litre', 40, 2, 42),
('Ayran', 'Ayran', 'Traditional yogurt drink', 'Geleneksel yoğurt içeceği', 'Beverages', 'İçecekler', 'liter', 'litre', 30, 2, 43),

-- Services
('Chef Service (per hour)', 'Şef Hizmeti (saat başı)', 'Professional chef at your venue', 'Mekanınızda profesyonel şef', 'Services', 'Hizmetler', 'hour', 'saat', 500, 3, 50),
('Waiter Service (per person)', 'Garson Hizmeti (kişi başı)', 'Professional waiter staff', 'Profesyonel garson personeli', 'Services', 'Hizmetler', 'person', 'kişi', 100, 1, 51),
('Equipment Rental', 'Ekipman Kiralama', 'Tables, chairs, tableware', 'Masa, sandalye, sofra takımı', 'Services', 'Hizmetler', 'person', 'kişi', 50, 20, 52),
('Decoration Package', 'Dekorasyon Paketi', 'Event decoration and setup', 'Etkinlik dekorasyonu ve kurulum', 'Services', 'Hizmetler', 'package', 'paket', 2000, 1, 53);