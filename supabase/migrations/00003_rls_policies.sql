-- ============================================
-- MINISTÉRIO+ - RLS Policies
-- ============================================
-- ATENÇÃO: Execute após 00001_initial_schema.sql e 00002_storage_and_seed.sql
-- 
-- Modelo de segurança:
--   SELECT:  Qualquer usuário autenticado pode ler todos os registros
--            (igreja compartilha dados entre líderes)
--   INSERT:  Apenas o próprio usuário (auth.uid()) como criador
--            (set_user_id trigger garante user_id correto)
--   UPDATE:  Apenas o próprio usuário (auth.uid() = user_id)
--   DELETE:  Apenas o próprio usuário (auth.uid() = user_id)
-- ============================================

-- ============================================
-- PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Nota: INSERT é feito pelo trigger handle_new_user() (SECURITY DEFINER),
-- que opera acima do RLS. Usuários não podem criar profiles manualmente.
-- Nota: DELETE é proibido — a FK ON DELETE CASCADE da tabela auth.users
-- gerencia a remoção automaticamente.

-- ============================================
-- MEMBROS
-- ============================================
DROP POLICY IF EXISTS "Users can view all membros" ON membros;
DROP POLICY IF EXISTS "Users can insert membros" ON membros;
DROP POLICY IF EXISTS "Users can insert own membros" ON membros;
DROP POLICY IF EXISTS "Users can update own membros" ON membros;
DROP POLICY IF EXISTS "Users can delete own membros" ON membros;

CREATE POLICY "Anyone authenticated can view membros"
  ON membros FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert membros"
  ON membros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membros"
  ON membros FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own membros"
  ON membros FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTOS
-- ============================================
DROP POLICY IF EXISTS "Users can view all eventos" ON eventos;
DROP POLICY IF EXISTS "Users can insert eventos" ON eventos;
DROP POLICY IF EXISTS "Users can insert own eventos" ON eventos;
DROP POLICY IF EXISTS "Users can update own eventos" ON eventos;
DROP POLICY IF EXISTS "Users can delete own eventos" ON eventos;

CREATE POLICY "Anyone authenticated can view eventos"
  ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert eventos"
  ON eventos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eventos"
  ON eventos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own eventos"
  ON eventos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ESCALAS
-- ============================================
DROP POLICY IF EXISTS "Users can view all escalas" ON escalas;
DROP POLICY IF EXISTS "Users can insert escalas" ON escalas;
DROP POLICY IF EXISTS "Users can insert own escalas" ON escalas;
DROP POLICY IF EXISTS "Users can update own escalas" ON escalas;
DROP POLICY IF EXISTS "Users can delete own escalas" ON escalas;

CREATE POLICY "Anyone authenticated can view escalas"
  ON escalas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert escalas"
  ON escalas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own escalas"
  ON escalas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own escalas"
  ON escalas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE (membro-fotos)
-- ============================================
-- Bucket privado — apenas usuários autenticados têm acesso
-- O path segue o padrão {membroId}/{timestamp}.{ext}
DROP POLICY IF EXISTS "Authenticated users can view member photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload member photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update member photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete member photos" ON storage.objects;

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
