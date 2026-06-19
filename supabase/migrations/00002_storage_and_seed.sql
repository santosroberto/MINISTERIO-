-- ============================================
-- MINISTÉRIO+ - Storage & Seed Data
-- ============================================
-- ATENÇÃO: Execute após 00001_initial_schema.sql
-- ============================================

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create bucket idempotently
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'membro-fotos',
  'membro-fotos',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Authenticated users can view member photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'membro-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload member photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'membro-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update member photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'membro-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete member photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'membro-fotos' AND auth.role() = 'authenticated');
