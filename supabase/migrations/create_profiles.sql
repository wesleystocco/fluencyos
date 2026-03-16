-- ============================================================================
-- Cria tabela de profiles para permitir login via username
-- ============================================================================
-- Executar isso no Supabase SQL editor (Projeto > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ler profiles públicos
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

-- Policy: usuários podem atualizar seu próprio profile
CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: usuários autenticados podem inserir profiles
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- AUTO-TRIGGER: Cria profile automaticamente após signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username, xp, level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata->>'username', SPLIT_PART(NEW.email, '@', 1)),
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Dropar trigger anterior se existir (evita erro na re-execução)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger que chama a função após novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
