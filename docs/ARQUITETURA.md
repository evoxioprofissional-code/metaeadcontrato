# Arquitetura — Grupo Educacional Meta · Matrícula + Contrato

## Stack
- **Frontend:** Vite + React 18 + TypeScript + shadcn/ui + TailwindCSS + Framer Motion.
- **Roteamento:** react-router-dom (SPA). Deploy Netlify (redirect `/* → /index.html`).
- **Estado/dados:** @tanstack/react-query; formulários com react-hook-form + Zod.
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions).
- **Geração de PDF / e-mail / IP:** Supabase Edge Functions (Deno).

> Decisão: mesmo ecossistema do projeto irmão `meta-ead-showcase` (Vite/React/shadcn), e **não**
> Next.js, para padronização e manutenção conjunta dentro do Grupo Meta.

## Projeto Supabase
- URL: `https://zagbrydckxgmvvfrdpsy.supabase.co` (dedicado a este sistema; separado do EAD).
- Schema versionado em `supabase/migrations/`. Tipos gerados em `src/integrations/supabase/types.ts`.

## Estrutura de pastas (`src/`)
```
src/
  components/       # UI compartilhada (ui/ = shadcn), theme-provider, theme-toggle
  pages/            # rotas (Index, NotFound, ...)
  hooks/            # hooks reutilizáveis
  lib/              # utils (cn, máscaras, validações compartilhadas)
  services/         # acesso a dados (Supabase, ViaCEP, etc.)
  types/            # tipos de domínio
  integrations/
    supabase/       # client.ts + types.ts (gerado)
```

## Fluxo de matrícula (visão geral)
1. Aluno preenche o **wizard** (Fase 1) — dados salvos em `localStorage` (autosave).
2. Lê e **assina** o contrato vinculado à versão publicada vigente (Fase 2).
3. **Submissão** acontece via **Edge Function** (`submit-enrollment`) com service role:
   cria `students` + `enrollments` + `documents` + `signatures`, gera nº de matrícula,
   gera PDF, registra IP, dispara e-mails (Fase 3).
4. Administração revisa no painel (Fase 4): Aprovar / Rejeitar / Baixar PDF.

> Por isso o RLS permite `INSERT` anônimo nas tabelas do fluxo, mas **leitura é restrita** à equipe.
> A escrita final fica na Edge Function (service role), que ignora RLS e centraliza validação.

## Segurança (RLS)
- `has_role(uuid, app_role)` — função `security definer` (evita recursão em policies).
- Equipe (`admin`/`secretaria`/`financeiro`) lê e gerencia matrículas, alunos, documentos.
- `courses`, `units`, `contracts`/`contract_versions` publicados são **legíveis publicamente**
  (a landing/wizard precisa listar cursos e exibir o contrato).
- Buckets de Storage privados: `documents`, `signatures`, `contracts-pdf`.
