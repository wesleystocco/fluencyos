-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 FLUENCYOS - RESET TOTAL (LIMPAR E RECONSTRUIR)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ⚠️ AVISO: Este script DELETA tudo que existe e reconstrói do zero
--
-- 📋 INSTRUÇÕES:
-- 1. Abra Supabase > SQL Editor > New Query
-- 2. Cole TODO o conteúdo abaixo
-- 3. Clique ▶️ RUN
-- 4. Espere mensagem "Success"
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 1: LIMPAR TUDO O QUE EXISTE
-- ───────────────────────────────────────────────────────────────────────────────

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Remover tabelas (na ordem correta para não quebrar foreign keys)
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 2: CRIAR TABELA PROFILES (LIMPA)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_config JSONB,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 3: CRIAR ÍNDICES
-- ───────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 4: HABILITAR ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos podem ler todos os profiles (para search de username)
CREATE POLICY "profiles_read_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Política 2: Cada usuário pode atualizar seu próprio profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 3: Usuários autenticados podem inserir
CREATE POLICY "profiles_insert_auth"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 5: CRIAR FUNÇÃO TRIGGER (SEM ERROS)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Extrair username dos metadados ou gerar do email
  v_username := COALESCE(
    (new.user_metadata->>'username')::TEXT,
    SPLIT_PART(new.email, '@', 1)
  );
  
  -- Sanitizar username (remover espaços, converter para lowercase)
  v_username := LOWER(TRIM(v_username));
  
  -- Se username ficar vazio, usar parte do user_id
  IF v_username = '' OR v_username IS NULL THEN
    v_username := SUBSTRING(new.id::TEXT, 1, 12);
  END IF;
  
  -- Inserir profile
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (new.id, new.email, v_username)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────────
-- ETAPA 6: CRIAR TRIGGER
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ PRONTO! TUDO RECONSTRUÍDO
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Próximos passos:
-- 1. Feche esta query
-- 2. Recarregue o app (F5)
-- 3. Teste criar conta
-- 4. Se funcionar → me avisa!
--
-- ═══════════════════════════════════════════════════════════════════════════════
