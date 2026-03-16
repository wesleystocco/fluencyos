-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔍 DIAGNÓSTICO E REPARO - PROFILES NÃO CRIADOS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Este script vai:
-- 1. Ver quantos usuários existem em auth.users
-- 2. Ver quantos profiles existem
-- 3. Criar profiles para usuários que não têm
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- PASSO 1: Ver o que existe no banco
SELECT 'Usuários no auth' AS info, COUNT(*) AS total FROM auth.users;
SELECT 'Profiles criados' AS info, COUNT(*) AS total FROM public.profiles;

-- PASSO 2: Ver usuários que NÃO têm profile
SELECT 
  u.id as user_id,
  u.email,
  u.user_metadata->>'username' AS username_metadata,
  SPLIT_PART(u.email, '@', 1) AS username_from_email,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- PASSO 3: Criar profiles faltando para esses usuários
INSERT INTO public.profiles (user_id, email, username)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.user_metadata->>'username',
    SPLIT_PART(u.email, '@', 1)
  ) AS username
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 4: Verificar resultado final
SELECT 
  'Profiles finais' AS info,
  COUNT(*) AS total
FROM public.profiles;

-- PASSO 5: Listar todos os profiles criados
SELECT 
  id,
  user_id,
  email,
  username,
  xp,
  level,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ RESULTADO
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Se a última query mostrou seu username e email, PRONTO!
-- Você pode fazer login agora.
--
-- ═══════════════════════════════════════════════════════════════════════════════
