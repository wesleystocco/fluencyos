-- ============================================================================
-- Adiciona colunas faltantes à tabela profiles - VERSÃO ROBUSTA
-- ============================================================================

-- Passo 1: Adicionar coluna email (se não existir)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Passo 2: Sincronizar email de auth.users (usando id como referência)
UPDATE public.profiles
SET email = u.email
FROM auth.users u
WHERE public.profiles.id = u.id AND public.profiles.email IS NULL;

-- Passo 3: Se ainda houver emails vazios, sincronizar usando user_metadata
UPDATE public.profiles p
SET email = COALESCE(
  (SELECT email FROM auth.users WHERE id = p.id),
  p.email
)
WHERE p.email IS NULL;

-- Passo 4: Adicionar coluna username (se não existir)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- Passo 5: Preencher username a partir de email
UPDATE public.profiles 
SET username = SPLIT_PART(COALESCE(email, id::text), '@', 1) 
WHERE (username IS NULL OR username = '') AND email IS NOT NULL;

-- Passo 6: Para os que não têm email, usar UUID como username
UPDATE public.profiles
SET username = SUBSTRING(id::text, 1, 8)
WHERE username IS NULL OR username = '';

-- Passo 7: Remover duplicatas de username antes de adicionar constraint
DELETE FROM public.profiles p1
WHERE p1.id NOT IN (
  SELECT DISTINCT ON (username) id FROM public.profiles WHERE username IS NOT NULL ORDER BY username, id
);

-- Passo 8: Adicionar coluna xp (se não existir)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;

-- Passo 9: Adicionar coluna level (se não existir)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

-- Passo 10: Criar índice para username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Passo 11: Adicionar constraint UNIQUE a username (com tratamento de erro)
DO $$ BEGIN
  ALTER TABLE public.profiles
  ADD CONSTRAINT unique_username UNIQUE (username);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Passo 12: Tornar username NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

-- ============================================================================
-- Recriar o trigger para auto-criar profiles
-- ============================================================================

-- Dropar função anterior se existir
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar nova função que funciona com a estrutura atual
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo profile ou atualizar o existente
  INSERT INTO public.profiles (id, email, username, xp, level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata->>'username', SPLIT_PART(NEW.email, '@', 1)),
    0,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
