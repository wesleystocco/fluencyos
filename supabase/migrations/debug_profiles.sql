-- ============================================================================
-- DEBUG - Verifica profiles criados (VERSÃO CORRIGIDA)
-- ============================================================================

-- 1. Ver todos os usuários na tabela auth.users (sem user_metadata)
SELECT id, email FROM auth.users LIMIT 10;

-- 2. Ver todos os profiles criados
SELECT id, email, username, xp, level FROM public.profiles LIMIT 10;

-- 3. Se não tiver profiles, isso significa que o trigger não funcionou
-- Executar manualmente para criar os profiles:

INSERT INTO public.profiles (id, email, username, xp, level)
SELECT 
  u.id,
  u.email,
  SPLIT_PART(u.email, '@', 1),
  0,
  1
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Ver resultado final
SELECT id, email, username, xp, level FROM public.profiles;
