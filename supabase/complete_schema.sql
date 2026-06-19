-- ============================================
-- MINISTÉRIO+ - Schema Completo
-- Execute tudo de uma vez no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 2. TABELA: PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. TABELA: MEMBROS
-- ============================================
CREATE TABLE membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  endereco TEXT NOT NULL,
  estado_civil TEXT NOT NULL CHECK (estado_civil IN (
    'Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'
  )),
  cargo TEXT NOT NULL,
  ministerio TEXT NOT NULL,
  data_batismo DATE NOT NULL,
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT DEFAULT '',
  foto_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE membros ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. TABELA: EVENTOS
-- ============================================
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  local TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN (
    'culto_especial', 'conferencia', 'congresso',
    'vigilia', 'encontro_casais', 'evento_jovem'
  )),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. TABELA: ESCALAS
-- ============================================
CREATE TABLE escalas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministerio TEXT NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  responsaveis UUID[] NOT NULL DEFAULT '{}',
  observacoes TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT hora_fim_check CHECK (hora_fim > hora_inicio)
);

ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- MEMBROS
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

-- EVENTOS
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

-- ESCALAS
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
-- 7. TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 8. TRIGGER: AUTO-POPULATE USER_ID
-- ============================================
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_membros_user_id ON membros;
CREATE TRIGGER set_membros_user_id
  BEFORE INSERT ON membros
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_eventos_user_id ON eventos;
CREATE TRIGGER set_eventos_user_id
  BEFORE INSERT ON eventos
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_escalas_user_id ON escalas;
CREATE TRIGGER set_escalas_user_id
  BEFORE INSERT ON escalas
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- ============================================
-- 9. TRIGGER: UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_membros_updated_at ON membros;
CREATE TRIGGER update_membros_updated_at
  BEFORE UPDATE ON membros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_escalas_updated_at ON escalas;
CREATE TRIGGER update_escalas_updated_at
  BEFORE UPDATE ON escalas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. INDEXES
-- ============================================
-- Full-text search
CREATE INDEX IF NOT EXISTS idx_membros_nome_fts ON membros USING GIN (to_tsvector('portuguese', nome));

-- Trigram indexes (ILIKE search)
CREATE INDEX IF NOT EXISTS idx_membros_nome_trgm ON membros USING GIN (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_membros_email_trgm ON membros USING GIN (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_membros_telefone_trgm ON membros USING GIN (telefone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_membros_cargo_trgm ON membros USING GIN (cargo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_membros_ministerio_trgm ON membros USING GIN (ministerio gin_trgm_ops);

-- Filtering & sorting
CREATE INDEX IF NOT EXISTS idx_membros_ministerio ON membros(ministerio);
CREATE INDEX IF NOT EXISTS idx_membros_data_nascimento ON membros(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_membros_ativo ON membros(ativo);
CREATE INDEX IF NOT EXISTS idx_membros_data_entrada ON membros(data_entrada);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_data_categoria ON eventos(data, categoria);

-- Escalas
CREATE INDEX IF NOT EXISTS idx_escalas_data ON escalas(data);
CREATE INDEX IF NOT EXISTS idx_escalas_ministerio ON escalas(ministerio);
CREATE INDEX IF NOT EXISTS idx_escalas_responsaveis ON escalas USING GIN (responsaveis);

-- ============================================
-- 11. STORAGE: BUCKET E POLICIES
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'membro-fotos',
  'membro-fotos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

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
