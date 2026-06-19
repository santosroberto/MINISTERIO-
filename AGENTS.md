# Ministério+ - Guia de Deploy e Configuração

## Pré-requisitos

1. **Conta Supabase** - Crie em https://supabase.com
2. **Conta Vercel** - Crie em https://vercel.com
3. **Repositório GitHub** - O código deve estar em um repositório Git

## Passo 1: Configurar Supabase

1. Crie um projeto no Supabase
2. Vá para **SQL Editor** e execute os arquivos em `supabase/migrations/`:
   - `00001_initial_schema.sql` - Cria todas as tabelas, RLS, índices e triggers
   - `00002_storage_and_seed.sql` - Cria bucket de storage e políticas
   - `00003_rls_policies.sql` - Reforço de políticas RLS
3. Em **Authentication > Settings**, configure:
   - `Site URL`: `http://localhost:3000` (dev) ou `https://ministerio-mais.vercel.app` (prod)
   - `Redirect URLs`: `http://localhost:3000/auth/callback`, `https://ministerio-mais.vercel.app/auth/callback`
4. Em **Storage**, verifique se o bucket `membro-fotos` foi criado

## Passo 2: Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Preencha com os dados do seu projeto Supabase (encontrados em **Settings > API**):
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/Public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (apenas para seed)

### Ambientes

No Vercel, configure as mesmas variáveis em **Project Settings > Environment Variables** para cada ambiente:

| Variável | Development | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dev URL | Supabase dev URL | Supabase prod URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dev | Anon key dev | Anon key prod |

> Dica: Use o mesmo projeto Supabase nos 3 ambientes ou crie projetos separados (dev/staging/prod).

## Passo 3: Popular Banco de Dados (Opcional)

```bash
npm run seed
```

Isso criará dados de exemplo (membros, eventos, escalas).

## Passo 4: Conectar Vercel

### Via GitHub Actions (Recomendado)

1. Crie o projeto no Vercel em https://vercel.com/new
2. Copie `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:
   ```bash
   vercel pull --yes --environment=production
   # Os IDs aparecem no arquivo .vercel/project.json
   ```
3. Adicione os secrets no GitHub (`Settings > Secrets and variables > Actions`):

   **Vercel:**
   - `VERCEL_TOKEN` — Token de deploy (https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` — ID da organização Vercel
   - `VERCEL_PROJECT_ID` — ID do projeto Vercel

   **Supabase:**
   - `NEXT_PUBLIC_SUPABASE_URL` — URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key do Supabase

4. Faça push para `main` — o pipeline executa automaticamente

### Manual

```bash
# Development (localhost)
vercel dev

# Preview (branch)
vercel

# Production
vercel --prod
```

## CI/CD Pipeline

O arquivo `.github/workflows/deploy.yml` configura **8 jobs** para 3 ambientes:

### Ambientes

| Ambiente | Branch | Trigger | URL |
|---|---|---|---|
| **Development** | Local | `npm run dev` | `http://localhost:3000` |
| **Preview** | PRs para `main`/`develop` | `pull_request` | `{branch}.ministerio-mais.vercel.app` |
| **Production** | `main` | `push` | `https://ministerio-mais.vercel.app` |

### Jobs

| Job | Descrição | Executa em |
|---|---|---|
| `lint` | ESLint + TypeScript check | PRs e push em `main`/`develop` |
| `build` | `next build` com env vars do Supabase | PRs e push em `main`/`develop` |
| `validate-migrations` | Verifica se migrations SQL existem e não estão vazias | PRs e push em `main`/`develop` |
| `test` | Detecta e executa testes (se existirem, pula se não) | PRs e push em `main`/`develop` |
| `security-audit` | `npm audit` + scan de secrets no código | PRs e push em `main`/`develop` |
| `deploy-preview` | Deploy preview no Vercel + comentário no PR | Apenas PRs |
| `deploy-production` | Deploy production no Vercel | Apenas push em `main` |

### Fluxo

```
PR aberto ─┬─ lint ─┬─ build ─┬─ deploy-preview (Vercel Preview URL comentada no PR)
            │        └─ test ──┤
            ├─ validate-migrations ─┤
            └─ security-audit ──────┘

Push em main ─→ lint + build + validate-migrations + test + security-audit
             ─→ deploy-production (Vercel Production)
```

### Fluxo completo de PR

```
1. Desenvolvedor cria branch feature/*
2. Abre PR para main
3. GitHub Actions executa: lint → build → validate-migrations → test → security-audit
4. Se todos passarem: deploy-preview gera URL de preview
5. Bot comenta o PR com o link de preview
6. Revisor testa no preview → aprova PR
7. Merge em main → deploy-production automático
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── login/          # Página de autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── membros/        # CRUD de membros
│   ├── eventos/        # CRUD de eventos
│   ├── escalas/        # CRUD de escalas
│   ├── aniversariantes/# Aniversariantes
│   ├── relatorios/     # Relatórios e estatísticas
│   └── auth/           # Callback, confirmação e reset de senha
├── auth/
│   └── auth-context.tsx # Contexto de autenticação
├── components/         # Componentes compartilhados
├── features/           # Componentes específicos
├── lib/
│   └── supabase/       # Clientes, tipos e mapeamento
├── services/           # Services (conectam ao Supabase)
├── types/              # Tipos TypeScript
└── proxy.ts            # Proxy de autenticação (middleware)

Config:
├── vercel.json         # Configuração Vercel (regions, headers, cache)
├── next.config.ts      # Next.js (images, security headers)
└── .github/workflows/  # CI/CD pipeline
```

## Autenticação

- Rota pública: `/login`
- Rotas protegidas automaticamente pelo `proxy.ts` (middleware)
- Suporte a login, registro, recuperação e reset de senha
- Perfil de usuário criado automaticamente via trigger SQL

## Storage

- Bucket: `membro-fotos`
- Máx: 5MB por arquivo
- Formatos: JPEG, PNG, WebP, GIF
- Acesso autenticado via RLS

## Segurança

- **RLS (Row Level Security)** em todas as tabelas
- Apenas usuários autenticados podem ler/escrever dados
- Senhas gerenciadas pelo Supabase Auth
- Triggers para `updated_at` automático
- Service Role Key usada apenas para seed (não exposta ao cliente)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Sanitização de inputs (XSS) + validação dupla (client + server)
- Error boundary global com fallback seguro
