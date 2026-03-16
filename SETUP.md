# FluencyOS - Guia de Configuração

## 🔧 Pré-requisitos

- Conta Supabase criada
- `.env.local` configurado com:
  ```
  NEXT_PUBLIC_SUPABASE_URL=seu_url_aqui
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
  ```

## 📋 Passos para Ativar Todas as Funcionalidades

### 1️⃣ Criar Tabela de Profiles (Login via Username)

**⚠️ IMPORTANTE: Execute isso no Supabase Console**

1. Vá para: `Seu Projeto > SQL Editor > New Query`
2. Cole todo o conteúdo do arquivo: `supabase/migrations/create_profiles.sql`
3. Clique em ▶️ Play / Execute

Isso:
- ✅ Cria a tabela `profiles` para armazenar usernames
- ✅ Permite login com username OU email
- ✅ Configura as políticas de segurança

### 2️⃣ Testar Login com Username + Email

Após criar a tabela, você pode:

**Para REGISTRAR:**
- E-mail: seu_email@example.com
- Username: seu_usuario (3-20 caracteres, sem espaços)
- Senha: crie uma senha forte
- Crie seu avatar randomicamente

**Para FAZER LOGIN:**
```
Opção 1: seu_email@example.com + senha
Opção 2: seu_usuario + senha
```

### 3️⃣ Usar o Avatar

O avatar agora é gerado automaticamente pelo DiceBear:
- Clicar em 🎲 (botão de shuffle) para avatar aleatório
- O avatar é salvo no seu profile
- Aparece no Dashboard

### 4️⃣ Acessar os Cursos

1. Faça login
2. Vá ao Dashboard
3. Na seção **"Inglês do Zero ao Fluente"**, clique em um módulo
4. Clique no link do módulo desbloqueado (ex: "Os Fundamentos")
5. Estude as lições e faça o quiz

### 5️⃣ Desafio Diário

- Na dashboard, há um widget "Desafio do Dia" na direita
- Complete 5 questões da sua dificuldade
- Ganhe XP e suba de nível
- Mude de dificuldade com os abas: Iniciante, Básico, Intermediário, Fluente

---

## 🐛 Troubleshooting

### "Perfil não encontrado" ao logar com username
**Solução:** Certifique-se de que a tabela `profiles` foi criada no supabase. Verifique no SQL Editor:
```sql
SELECT * FROM public.profiles;
```

### Avatar não aparece
**Solução:** Verifique:
1. A imagem está carregando (abra console do navegador F12)
2. Não há erro CORS (deve estar OK pois é SVG puro)
3. Tente recriar o avatar

### Não consegue entrar no curso/módulo
**Solução:** Verifique:
1. Você fez login (deve haver um avatar no canto superior)
2. O módulo está desbloqueado (Se aparecer 🔒, está bloqueado)
3. Tente atualizar a página (F5)

### "Confirme seu e-mail primeiro"
**Solução:** 
1. Procure um email de confirmação na sua caixa de entrada (ou spam)
2. Clique no link de confirmação
3. Tente fazer login novamente

---

## 🚀 Como Usar

### Dashboard
- **Perfil:** Veja seu nível, XP total e sequência
- **Metas do Dia:** 3 objetivos para ganhar XP
- **Cursos:** Lista de 8 módulos (1-2 desbloqueados)
- **Desafio Diário:** Widget com 5 questões
- **Histórico:** Últimas ações e XP ganho

### Página de Curso (Módulo 1)
- **Lições:** 3 lições disponíveis
- **Vocabulário:** Aprenda novos termos
- **Frases:** Veja usos práticos
- **Quiz:** Teste seu conhecimento e ganhe XP

### Sistema de XP
- **Desafio diário:** +30 XP
- **Questão correta:** +10 XP
- **Completar lição:** +50 XP
- **Sequência de 7 dias:** 🏆 Desbloqueador de avatar especial

---

## 📝 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Login e signup
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/     # Dashboard e cursos
│   │   ├── dashboard/page.tsx
│   │   └── curso/modulo-1/page.tsx
│   ├── page.tsx         # Página inicial
│   └── layout.tsx
├── components/          # Componentes reutilizáveis
├── lib/                 # Funções utilitárias
│   └── supabase.ts
├── store/               # Zustand stores
│   └── xp.ts
└── types/               # Tipos TypeScript
```

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique o console do navegador (F12) para erros
2. Verifique que `.env.local` tem as chaves corretas
3. Execute a migração SQL
4. Teste em modo anônimo/incognito (limpa cache)

---

**Última atualização:** 12 março, 2026
