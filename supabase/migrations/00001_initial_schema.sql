-- ============================================
-- MINISTÉRIO+ - Database Schema
-- ============================================
-- ATENÇÃO: Execute este arquivo no SQL Editor do Supabase
-- Ordem: migrations/00001_initial_schema.sql
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- PROFILES (extends Supabase Auth users)
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

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- MEMBROS
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

CREATE POLICY "Users can view all membros"
  ON membros FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert membros"
  ON membros FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own membros"
  ON membros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own membros"
  ON membros FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTOS
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

CREATE POLICY "Users can view all eventos"
  ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert eventos"
  ON eventos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own eventos"
  ON eventos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own eventos"
  ON eventos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ESCALAS
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

CREATE POLICY "Users can view all escalas"
  ON escalas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert escalas"
  ON escalas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own escalas"
  ON escalas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own escalas"
  ON escalas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
-- Full-text search on membros.nome (português)
CREATE INDEX idx_membros_nome_fts ON membros USING GIN (to_tsvector('portuguese', nome));

-- Trigram indexes for ILIKE search (nome, email, telefone, cargo, ministerio)
CREATE INDEX idx_membros_nome_trgm ON membros USING GIN (nome gin_trgm_ops);
CREATE INDEX idx_membros_email_trgm ON membros USING GIN (email gin_trgm_ops);
CREATE INDEX idx_membros_telefone_trgm ON membros USING GIN (telefone gin_trgm_ops);
CREATE INDEX idx_membros_cargo_trgm ON membros USING GIN (cargo gin_trgm_ops);
CREATE INDEX idx_membros_ministerio_trgm ON membros USING GIN (ministerio gin_trgm_ops);

-- Filtering & sorting indexes
CREATE INDEX idx_membros_ministerio ON membros(ministerio);
CREATE INDEX idx_membros_data_nascimento ON membros(data_nascimento);
CREATE INDEX idx_membros_ativo ON membros(ativo);
CREATE INDEX idx_membros_data_entrada ON membros(data_entrada);

-- Eventos indexes
CREATE INDEX idx_eventos_data ON eventos(data);
CREATE INDEX idx_eventos_categoria ON eventos(categoria);
CREATE INDEX idx_eventos_data_categoria ON eventos(data, categoria);

-- Escalas indexes
CREATE INDEX idx_escalas_data ON escalas(data);
CREATE INDEX idx_escalas_ministerio ON escalas(ministerio);
CREATE INDEX idx_escalas_responsaveis ON escalas USING GIN (responsaveis);

-- ============================================
-- AUTO-POPULATE USER_ID
-- ============================================
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_membros_user_id
  BEFORE INSERT ON membros
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_eventos_user_id
  BEFORE INSERT ON eventos
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_escalas_user_id
  BEFORE INSERT ON escalas
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_membros_updated_at
  BEFORE UPDATE ON membros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_escalas_updated_at
  BEFORE UPDATE ON escalas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
