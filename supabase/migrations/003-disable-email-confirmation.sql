-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔓 DESABILITAR EXIGÊNCIA DE CONFIRMAÇÃO DE EMAIL
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Este script permite que usuários façam login SEM confirmar email primeiro.
-- Útil para desenvolvimento e testes.
--
-- ⚠️ INSTRUÇÕES:
-- 1. Abra Supabase > Settings > Auth
-- 2. Procure por "Email confirmations" ou "Require email confirmation"
-- 3. DESMARQUE a opção "Enable Email Confirmations"
--
-- OU faça isso por SQL (abaixo):
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- Desabilitar RLS de email_confirmed_at (permitir login sem confirmar)
-- Isto remove a restrição de Supabase que bloqueia login sem email confirmado

UPDATE public.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ PRONTO!
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Agora usuários podem:
-- 1. Criar conta
-- 2. Fazer login imediatamente (sem esperar email)
-- 3. Email ainda será enviado (quando SMTP estiver configurado)
--
-- ═══════════════════════════════════════════════════════════════════════════════
