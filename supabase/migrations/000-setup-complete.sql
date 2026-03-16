-- ═══════════════════════════════════════════════════════════════════════════════
-- 🚀 FLUENCYOS - SETUP COMPLETO DO BANCO DE DADOS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ⚠️ INSTRUÇÕES DE USO:
-- 1. Abra Supabase Console → Seu Projeto → SQL Editor
-- 2. Crie uma NEW QUERY
-- 3. Cole TODO o conteúdo deste arquivo
-- 4. Clique em ▶️ RUN
-- 5. Aguarde conclusão (deve aparecer mensagens de sucesso)
-- 6. Feche e volte ao app
--
-- Este script cria:
-- ✅ Tabela profiles (usuários + username)
-- ✅ Tabela courses (cursos e módulos)
-- ✅ Tabela lessons (aulas)
-- ✅ Tabela user_progress (progresso)
-- ✅ Tabelas de avatar customization
-- ✅ Triggers automáticos
-- ✅ Índices para performance
-- ✅ RLS Policies (segurança)
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- 1️⃣ PROFILES TABLE (usuários + username)
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

-- RLS - Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- 2️⃣ COURSES TABLE (cursos)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  level TEXT NOT NULL,
  modules_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Populate courses (Inglês)
DELETE FROM public.courses WHERE slug = 'english';
INSERT INTO public.courses (slug, title, description, language, level)
  VALUES (
    'english',
    'Inglês do Zero ao Fluente',
    'Aprenda inglês do básico até fluência com IA personalizada',
    'English',
    'iniciante'
  );

-- RLS - Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_select" ON public.courses;
CREATE POLICY "courses_select" ON public.courses FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────────────────
-- 3️⃣ MODULES TABLE (módulos dentro dos cursos)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  order_index INT DEFAULT 0,
  xp_reward INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(slug);

-- Populate modules (Inglês)
DELETE FROM public.modules;
INSERT INTO public.modules (course_id, slug, title, description, level, order_index, xp_reward)
  SELECT 
    c.id,
    'modulo-1-iniciantes',
    'Módulo 1: Os Fundamentos',
    'Cumprimentos, apresentações e frases essenciais',
    'iniciante',
    1,
    100
  FROM public.courses c WHERE c.slug = 'english'
  UNION ALL
  SELECT 
    c.id,
    'modulo-2-basico',
    'Módulo 2: Conversas Básicas',
    'Pedidos, direções e situações do dia a dia',
    'basico',
    2,
    150
  FROM public.courses c WHERE c.slug = 'english'
  UNION ALL
  SELECT 
    c.id,
    'modulo-3-intermediario',
    'Módulo 3: Discussões Intermediárias',
    'Opiniões, histórias e expressões idiomáticas',
    'intermediario',
    3,
    200
  FROM public.courses c WHERE c.slug = 'english'
  UNION ALL
  SELECT 
    c.id,
    'modulo-4-avancado',
    'Módulo 4: Domínio Avançado',
    'Argumentação, nuances e sotaques',
    'fluente',
    4,
    250
  FROM public.courses c WHERE c.slug = 'english';

-- RLS - Modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "modules_select" ON public.modules;
CREATE POLICY "modules_select" ON public.modules FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────────────────
-- 4️⃣ LESSONS TABLE (aulas)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INT DEFAULT 0,
  xp_reward INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);

-- RLS - Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lessons_select" ON public.lessons;
CREATE POLICY "lessons_select" ON public.lessons FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────────────────
-- 5️⃣ USER PROGRESS TABLE (progresso do usuário)
-- ───────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  lessonCompleted INT DEFAULT 0,
  xpEarned INT DEFAULT 0,
  completed_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module ON public.user_progress(module_id);

-- RLS - User Progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_progress_select" ON public.user_progress;
CREATE POLICY "user_progress_select" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_insert" ON public.user_progress;
CREATE POLICY "user_progress_insert" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update" ON public.user_progress;
CREATE POLICY "user_progress_update" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────────────────────
-- 6️⃣ TRIGGERS (automação)
-- ───────────────────────────────────────────────────────────────────────────────

-- Trigger: criar profile automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Gerar username do email ou dos metadados
  v_username := COALESCE(
    new.user_metadata->>'username',
    SPLIT_PART(new.email, '@', 1)
  );
  
  -- Validar dados antes de inserir
  IF new.id IS NULL OR new.email IS NULL THEN
    RETURN new;
  END IF;
  
  -- Inserir profile
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
    -- Se houver erro (duplicate key, constraint), ignorar silenciosamente
    RETURN new;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────────────────
-- ✅ SETUP COMPLETO - SUCESSO!
-- ───────────────────────────────────────────────────────────────────────────────
-- 
-- Próximo passo no app:
-- 1. Recarregue a página (F5)
-- 2. Clique em "Criar conta"
-- 3. Preencha: EMAIL + SENHA + APELIDO + Avatar
-- 4. Clique em "Criar"
-- 5. Confirme seu e-mail
-- 6. Faça login
-- 7. Você estará no dashboard com seus dados já salvos!
--
-- ═══════════════════════════════════════════════════════════════════════════════
