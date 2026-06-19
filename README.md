<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-2.49.4-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow" alt="Status" />
</p>

# Ministério+

Sistema web para gestão ministerial — membros, eventos, escalas e relatórios.

## Funcionalidades

- **Membros** — Cadastro completo com foto, busca textual com paginação, exportação
- **Eventos** — Agendamento com categorias, calendário visual, histórico
- **Escalas** — Alocação de responsáveis por ministério, validação de conflitos de horário
- **Dashboard** — Indicadores (aniversariantes do mês, total de membros ativos, próximos eventos, escalas da semana)
- **Autenticação** — Login, registro, recuperação e redefinição de senha via Supabase Auth
- **Aniversariantes** — Lista filtrada por mês com dias restantes
- **Relatórios** — Estatísticas por ministério, gráficos com Recharts

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Middleware) |
| Linguagem | [TypeScript 5](https://www.typescriptlang.org) |
| Estilização | [Tailwind CSS 4](https://tailwindcss.com) + `class-variance-authority` |
| Banco de dados | [Supabase](https://supabase.com) (PostgreSQL + RLS) |
| Autenticação | [Supabase Auth](https://supabase.com/auth) (SSR com cookies) |
| Storage | [Supabase Storage](https://supabase.com/storage) (fotos de membros) |
| Formulários | [React Hook Form](https://react-hook-form.com) + [Zod 4](https://zod.dev) |
| Gráficos | [Recharts](https://recharts.org) |
| UI (tabelas) | [TanStack Table](https://tanstack.com/table) |
| Notificações | [Sonner](https://sonner.emilkowal.ski) |
| Ícones | [Lucide React](https://lucide.dev) |
| CI/CD | GitHub Actions + Vercel |

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ministerio-mais.git
cd ministerio-mais

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
```

Preencha `.env.local` com os dados do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Configuração do Supabase

### 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Escolha a região mais próxima (ex: `South America (São Paulo) — sa-south-1`)

### 2. Executar migrations

Vá para **SQL Editor** e execute os 3 arquivos em ordem:

| Arquivo | Conteúdo |
|---|---|
| `supabase/migrations/00001_initial_schema.sql` | Tabelas (membros, eventos, escalas, profiles), índices (trigram + FTS), triggers (user_id automático, updated_at), RLS inicial |
| `supabase/migrations/00002_storage_and_seed.sql` | Bucket `membro-fotos` (5MB, JPEG/PNG/WebP/GIF), políticas de storage |
| `supabase/migrations/00003_rls_policies.sql` | Reforço de políticas RLS com `WITH CHECK` em todas as tabelas |

### 3. Configurar autenticação

Em **Authentication > Settings**:

| Campo | Desenvolvimento | Produção |
|---|---|---|
| `Site URL` | `http://localhost:3000` | `https://ministerio-mais.vercel.app` |
| `Redirect URLs` | `http://localhost:3000/auth/callback` | `https://[...]/auth/callback` |

### 4. Verificar storage

O bucket `membro-fotos` é criado pela migration `00002_storage_and_seed.sql`. Confirme em **Storage** que ele aparece com as políticas RLS ativas.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Finalidade |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase (exposta ao cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anônima (exposta ao cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed | Chave de service role (apenas para `npm run seed`, nunca exposta ao cliente) |

### Ambientes no Vercel

| Variável | Development | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dev | Supabase dev | Supabase prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dev | Anon key dev | Anon key prod |

> Dica: use o mesmo Supabase nos 3 ambientes ou crie projetos separados (dev/staging/prod).

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (`localhost:3000`) |
| `npm run build` | Compila para produção (`next build`) |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | ESLint + TypeScript check |
| `npm run typecheck` | Apenas TypeScript check (`tsc --noEmit`) |
| `npm run seed` | Popula banco com dados de exemplo (requer `SUPABASE_SERVICE_ROLE_KEY`) |
| `npm run db:migrate` | Push de migrations via Supabase CLI |

---

## População de Dados (Seed)

```bash
npm run seed
```

Cria dados de exemplo: membros, eventos, escalas. Requer `SUPABASE_SERVICE_ROLE_KEY` configurada no `.env.local`.

---

## Storage

- **Bucket:** `membro-fotos`
- **Tamanho máximo:** 5 MB
- **Formatos:** JPEG, PNG, WebP, GIF
- **Acesso:** Restrito a usuários autenticados (RLS)
- **Path:** `{membroId}/{timestamp}.{ext}`

---

## Segurança

- **RLS (Row Level Security)** em todas as tabelas e storage
- **Modelo de acesso:**
  - `SELECT`: qualquer usuário autenticado (igreja compartilhada)
  - `INSERT`: apenas o próprio usuário (setado automaticamente pelo trigger `set_user_id`)
  - `UPDATE/DELETE`: apenas o criador do registro (`auth.uid() = user_id`)
- Profile criado automaticamente via trigger `handle_new_user()` (SECURITY DEFINER)
- Triggers `update_updated_at()` em todas as tabelas
- **Service Role Key nunca exposta ao cliente**
- **Security headers** via Vercel (`vercel.json`) + Next.js (`next.config.ts`):
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restritivo
  - Cache público para assets estáticos (1 ano)

---

## CI/CD

O pipeline em `.github/workflows/deploy.yml` executa **8 jobs**:

| Job | Gatilho | Descrição |
|---|---|---|
| **lint** | PRs + push (main/develop) | ESLint + `tsc --noEmit` |
| **build** | PRs + push (main/develop) | `next build` com env vars do Supabase |
| **validate-migrations** | PRs + push (main/develop) | Verifica se arquivos SQL existem e não estão vazios |
| **test** | PRs + push (main/develop) | Detecta e executa testes (`*.test.*` / `*.spec.*`); pula se não existirem |
| **security-audit** | PRs + push (main/develop) | `npm audit` + scan de secrets no código |
| **deploy-preview** | PRs para main/develop | Deploy preview no Vercel + comentário automático no PR |
| **deploy-production** | Push em main | Deploy production no Vercel |

### Fluxo

```
PR aberto ── lint → build → validate-migrations → test → security-audit
         └── deploy-preview (Vercel Preview + comentário no PR)

Push em main ── lint → build → validate-migrations → test → security-audit
            └── deploy-production (Vercel Production)
```

---

## Deploy

### Via GitHub Actions (recomendado)

1. Crie o projeto no [Vercel](https://vercel.com/new)
2. Obtenha `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:
   ```bash
   npx vercel pull --yes --environment=production
   # Os IDs aparecem em .vercel/project.json
   ```
3. Adicione secrets no GitHub (**Settings > Secrets and variables > Actions**):

   **Vercel:**
   - `VERCEL_TOKEN` — token de deploy ([vercel.com/account/tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` — ID da organização
   - `VERCEL_PROJECT_ID` — ID do projeto

   **Supabase:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Faça push para `main` — o pipeline executa automaticamente

### Manual

```bash
# Desenvolvimento
npx vercel dev

# Preview (branch atual)
npx vercel

# Produção
npx vercel --prod
```

---

## Solução de Problemas

### Erro ao conectar no Supabase

```text
AuthRetryableFetchError: Failed to fetch
```

- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos em `.env.local`
- Confirme que o projeto Supabase não está em pausa (planos gratuitos pausam após 7 dias de inatividade)

### Erro de permissão (RLS)

```text
new row violates row-level security policy for table "membros"
```

- O trigger `set_user_id()` precisa existir no banco — execute a migration `00001_initial_schema.sql`
- O usuário precisa estar autenticado (faça login novamente)

### Erro de storage

```text
row-level security policy for table "objects" violated
```

- Execute a migration `00002_storage_and_seed.sql` para criar as políticas do bucket
- Verifique se o bucket `membro-fotos` foi criado

### Erro de build no Vercel

```text
Error: Could not find a declaration file for module '...'
```

```bash
npm install
npm run build
```

- Verifique se todas as dependências estão instaladas (`npm ci`)
- Confirme as env vars no Vercel (**Project Settings > Environment Variables**)

### Erro de tipo TypeScript

```bash
npm run typecheck
```

Corrija os erros apontados pelo compilador antes do build.

### Logs e monitoramento

- **Client:** logs estruturados via `src/lib/logger.ts` (debug/info/warn/error)
- **Server:** endpoint `POST /api/monitor` recebe logs de erro/warn do client
- **Console:** erros de autenticação e operações CRUD são logados com contexto (`Auth`, `MemberService`, etc.)
- Em desenvolvimento os logs aparecem no console do navegador; em produção apenas `info`+ são emitidos

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── login/              # Página de login
│   ├── dashboard/          # Dashboard principal
│   ├── membros/            # CRUD de membros
│   ├── eventos/            # CRUD de eventos
│   ├── escalas/            # CRUD de escalas
│   ├── aniversariantes/    # Aniversariantes do mês
│   ├── relatorios/         # Relatórios e estatísticas
│   ├── auth/               # Callback, confirmação e reset de senha
│   └── api/monitor/        # Endpoint de monitoramento de logs
├── auth/
│   └── auth-context.tsx    # Contexto de autenticação
├── components/             # Componentes compartilhados (UI)
├── features/               # Componentes específicos (tabelas, formulários, etc.)
├── lib/
│   ├── supabase/           # Clientes, tipos, mapeamento
│   ├── logger.ts           # Logger centralizado
│   └── validate.ts         # Validação com Zod
├── services/               # Services (conectam ao Supabase)
├── types/                  # Tipos TypeScript
└── proxy.ts                # Middleware de autenticação

supabase/
└── migrations/             # Migrations SQL
    ├── 00001_initial_schema.sql
    ├── 00002_storage_and_seed.sql
    └── 00003_rls_policies.sql

.github/
└── workflows/
    └── deploy.yml          # CI/CD pipeline (8 jobs, 3 ambientes)
```

---

## Licença

MIT
