
-- Add position columns for floor plan
ALTER TABLE public.restaurant_tables 
ADD COLUMN pos_x NUMERIC DEFAULT 100,
ADD COLUMN pos_y NUMERIC DEFAULT 100;
