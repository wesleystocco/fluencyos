-- ============================================================================
-- VALIDA E CORRIGE RLS PARA PERMITIR LEITURA DE USERNAMES
-- ============================================================================

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Listar todas as políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Dropar todas as políticas antigas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- RECRIA AS POLÍTICAS COM PERMISSÕES CORRETAS:

-- Política 1: Todos podem LER profiles públicos (necessário para login via username)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT
  USING (true);

-- Política 2: Usuários podem VER seus próprios dados
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política 3: Usuários autenticados podem inserir seu próprio profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verificar resultado
SELECT * FROM pg_policies WHERE tablename = 'profiles';
