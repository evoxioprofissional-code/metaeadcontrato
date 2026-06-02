# Grupo Educacional Meta — Matrícula Online + Contrato Digital

Sistema web **premium**, **mobile-first**, de matrícula online com contrato digital versionado,
assinatura digital e painel administrativo.

## Stack
Vite · React 18 · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · Supabase · React Query ·
react-hook-form · Zod · pdf-lib (Edge Functions) · Lucide.

## Começando
```bash
npm install
cp .env.example .env   # preencha VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev            # http://localhost:8080
```

### Variáveis de ambiente
| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (`https://zagbrydckxgmvvfrdpsy.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | `zagbrydckxgmvvfrdpsy` |

## Banco de dados
Migrations em [`supabase/migrations/`](supabase/migrations). Aplicar via Supabase CLI ou SQL Editor.
Gerar tipos: `npx supabase gen types typescript --project-id zagbrydckxgmvvfrdpsy > src/integrations/supabase/types.ts`.

## Documentação
Pasta [`docs/`](docs): [ROADMAP](docs/ROADMAP.md) · [SPEC](docs/SPEC.md) ·
[ARQUITETURA](docs/ARQUITETURA.md) · [DESIGN](docs/DESIGN.md) · [DB-SCHEMA](docs/DB-SCHEMA.md).

## Scripts
`npm run dev` · `npm run build` · `npm run preview` · `npm run lint` · `npm run test`.
