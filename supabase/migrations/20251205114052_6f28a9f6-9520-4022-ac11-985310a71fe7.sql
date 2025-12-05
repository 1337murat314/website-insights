
-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- RLS Policies for menu-images bucket
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Admins can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND is_admin_or_manager(auth.uid()));
