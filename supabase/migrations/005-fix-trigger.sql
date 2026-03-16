-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 FIX - DATABASE ERROR SAVING NEW USER
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Este script remove o trigger que está quebrando e configura tudo corretamente
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ETAPA 1: Remover trigger quebrado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- ETAPA 2: Remover função antiga
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ETAPA 3: Remover RLS policies temporariamente (para debug)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ETAPA 4: Criar função trigger MUITO simples (sem erros)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- ETAPA 5: Criar trigger simples
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ETAPA 6: Reabilitar RLS COM POLICIES CORRETAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_auth" ON public.profiles;

-- Criar policies NOVAS
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ PRONTO!
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Agora tente novamente:
-- 1. Recarregue o app (F5)
-- 2. Clique "Criar Conta"
-- 3. Preencha tudo
-- 4. Clique "Criar"
--
-- Deve entrar direto no dashboard!
--
-- ═══════════════════════════════════════════════════════════════════════════════
