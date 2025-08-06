-- Remover tabelas e políticas existentes para garantir um estado limpo
-- CUIDADO: Isso apagará TODOS os dados existentes nessas tabelas!
DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP POLICY IF EXISTS "Users can view own translations" ON translations;
DROP POLICY IF EXISTS "Users can insert own translations" ON translations;
DROP POLICY IF EXISTS "Allow authenticated or anonymous inserts" ON translations; -- Política corrigida
DROP POLICY IF EXISTS "Users can update own translations" ON translations;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Criar tabela de traduções
CREATE TABLE IF NOT EXISTS translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NULL, -- AGORA É EXPLICITAMENTE NULLABLE
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  media_url TEXT,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de usuários (extensão da auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  translation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para traduções (usuários só veem suas próprias)
CREATE POLICY "Users can view own translations" ON translations
  FOR SELECT USING (auth.uid() = user_id);

-- POLÍTICA DE INSERÇÃO CORRIGIDA: Permite inserções por usuários autenticados OU anônimos
CREATE POLICY "Allow authenticated or anonymous inserts" ON translations
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update own translations" ON translations
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para perfis
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
