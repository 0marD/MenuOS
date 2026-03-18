-- Storage bucket for menu item photos
-- NOTE: The bucket itself must be created via Supabase Dashboard or CLI:
--   supabase storage create menu-photos --public
-- This migration only creates the RLS policies.

-- Allow authenticated admins to upload to their org folder
CREATE POLICY "Admin can upload menu photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'menu-photos'
    AND (storage.foldername(name))[1] = (
      SELECT o.id::text
      FROM organizations o
      INNER JOIN staff_users s ON s.organization_id = o.id
      WHERE s.auth_id = auth.uid()
      LIMIT 1
    )
  );

-- Allow authenticated admins to update/delete their own photos
CREATE POLICY "Admin can manage own menu photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'menu-photos'
    AND (storage.foldername(name))[1] = (
      SELECT o.id::text
      FROM organizations o
      INNER JOIN staff_users s ON s.organization_id = o.id
      WHERE s.auth_id = auth.uid()
      LIMIT 1
    )
  );

-- Public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "Public can view menu photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'menu-photos');
