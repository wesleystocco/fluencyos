-- ═══════════════════════════════════════════════════════════════════════════════
-- 🚀 FLUENCYOS - SETUP SIMPLES (SÓ PROFILES)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- 📋 INSTRUÇÕES:
-- 1. Abra Supabase > SQL Editor > New Query
-- 2. Cole TODO o conteúdo abaixo
-- 3. Clique ▶️ RUN
-- 4. Espere a mensagem "Success"
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- 1️⃣ DROPAR OBJETOS ANTIGOS (LIMPAR)
-- ───────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ───────────────────────────────────────────────────────────────────────────────
-- 2️⃣ CRIAR TABELA PROFILES
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_config JSONB DEFAULT NULL,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_activity_date TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 3️⃣ CRIAR ÍNDICES (para performance)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

-- ───────────────────────────────────────────────────────────────────────────────
-- 4️⃣ HABILITAR RLS (SEGURANÇA)
-- ───────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para buscar usernames)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT USING (true);

-- Permitir atualização do próprio profile
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
CREATE POLICY "Enable update for own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Permitir inserção para usuários autenticados
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- 5️⃣ CRIAR FUNÇÃO TRIGGER
-- ───────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Extrair username dos metadados ou gerar do email
  v_username := COALESCE(
    new.user_metadata->>'username',
    SPLIT_PART(new.email, '@', 1)
  );
  
  -- Validar que os campos essenciais existem
  IF new.id IS NULL OR new.email IS NULL OR v_username = '' THEN
    RETURN new;
  END IF;
  
  -- Tentar inserir o profile
  BEGIN
    INSERT INTO public.profiles (user_id, email, username, xp, level)
    VALUES (
      new.id,
      new.email,
      v_username,
      0,
      1
    );
  EXCEPTION WHEN others THEN
    -- Se houver erro, apenas registrar e continuar
    RAISE LOG 'Erro ao criar profile para user %: %', new.id, SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ───────────────────────────────────────────────────────────────────────────────
-- 6️⃣ CRIAR TRIGGER
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SETUP FINALIZADO!
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Próximos passos:
-- 1. Recarregue o app (F5)
-- 2. Teste: Criar conta
-- 3. Se funcionar, me avisa que continuamos com os cursos!
--
-- Se tiver erro, abra F12, console e compartilhe o erro exato comigo.
-- 
-- ═══════════════════════════════════════════════════════════════════════════════
