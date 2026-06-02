# Schema do banco — Supabase (Postgres)

Migration inicial: `supabase/migrations/0001_init.sql`. Tudo com **RLS habilitado**.

## Enums
- `app_role`: `admin` · `secretaria` · `financeiro`
- `enrollment_status`: `pendente` · `aprovada` · `rejeitada`
- `sexo`: `masculino` · `feminino` · `outro` · `nao_informar`
- `estado_civil`: `solteiro` · `casado` · `divorciado` · `viuvo` · `uniao_estavel`
- `turno`: `manha` · `tarde` · `noite` · `integral`
- `document_type`: `rg_frente` · `rg_verso` · `cpf` · `comprovante_residencia`
- `signature_method`: `desenho` · `digitado` · `upload`

## Tabelas
### `profiles`
Perfil do usuário da equipe (1:1 com `auth.users`). `id`, `full_name`, `email`, `created_at`.

### `user_roles`
Papéis por usuário (separado do perfil p/ RLS segura). `user_id`, `role` (`app_role`), único por par.

### `units`
Unidades/polos. `id`, `name`, `address`, `city`, `state`, `phone`, `active`, `created_at`.

### `courses`
Cursos. `id`, `name`, `slug`, `description`, `duration_months`, `price`, `turnos` (array), `active`, `created_at`.

### `contracts`
Container do contrato (modelo). `id`, `title`, `description`, `active`, `created_at`.

### `contract_versions`
Versões imutáveis do contrato. `id`, `contract_id`, `version` (ex.: `1.0`), `content_html`,
`content_json`, `is_published`, `created_by`, `created_at`. A matrícula referencia esta tabela.

### `students`
Aluno. Dados pessoais + contato + endereço. `cpf` único. `id`, `full_name`, `cpf`, `rg`,
`birth_date`, `sexo`, `estado_civil`, `phone`, `whatsapp`, `email`, `cep`, `street`, `number`,
`complement`, `neighborhood`, `city`, `state`, `created_at`.

### `enrollments`
Matrícula. `id`, `enrollment_code` (único, ex.: `MAT-2026-000001`), `student_id`, `course_id`,
`unit_id`, `turno`, `contract_version_id`, `status` (default `pendente`), `accepted_terms`,
`signed_at`, `signer_ip`, `pdf_path`, `notes`, `reviewed_by`, `reviewed_at`, `created_at`.

### `documents`
Documentos enviados. `id`, `enrollment_id`, `type` (`document_type`), `file_path`, `file_name`,
`mime_type`, `size_bytes`, `created_at`.

### `signatures`
Assinatura. `id`, `enrollment_id`, `method` (`signature_method`), `image_path`, `typed_name`,
`ip`, `user_agent`, `created_at`.

## Geração do nº de matrícula
Sequência `enrollment_seq` + trigger `set_enrollment_code` → `MAT-<ano>-<6 dígitos>`.

## Storage (buckets privados)
`documents` · `signatures` · `contracts-pdf`.

## Resumo RLS
- Equipe (`has_role`) gerencia tudo do fluxo (read/update/delete).
- `INSERT` público permitido em `students`/`enrollments`/`documents`/`signatures`
  (a submissão final é centralizada na Edge Function `submit-enrollment`, service role).
- `courses`/`units` ativos e `contracts`/`contract_versions` publicados: **SELECT público**.
