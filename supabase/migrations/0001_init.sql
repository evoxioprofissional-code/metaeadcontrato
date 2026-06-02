-- =============================================================================
-- Grupo Educacional Meta · Matrícula + Contrato
-- Migration inicial: schema, enums, funções, triggers, RLS, Storage, seed.
-- =============================================================================

-- --------------------------------------------------------------------------
-- Enums
-- --------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'secretaria', 'financeiro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enrollment_status as enum ('pendente', 'aprovada', 'rejeitada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sexo as enum ('masculino', 'feminino', 'outro', 'nao_informar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.estado_civil as enum ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.turno as enum ('manha', 'tarde', 'noite', 'integral');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_type as enum ('rg_frente', 'rg_verso', 'cpf', 'comprovante_residencia');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.signature_method as enum ('desenho', 'digitado', 'upload');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
-- Função utilitária: updated_at
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- Tabelas: identidade / equipe
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.app_role not null,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

-- has_role: SECURITY DEFINER evita recursão de RLS ao checar papéis.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- is_staff: qualquer papel interno (admin/secretaria/financeiro).
create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id);
$$;

-- Cria profile automaticamente ao criar usuário no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------------------
-- Tabelas: catálogo
-- --------------------------------------------------------------------------
create table if not exists public.units (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  city        text,
  state       text,
  phone       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.courses (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,
  description      text,
  duration_months  integer,
  price            numeric(10, 2),
  turnos           public.turno[] not null default '{}',
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Tabelas: contratos (modelo + versões imutáveis)
-- --------------------------------------------------------------------------
create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_contracts_updated
  before update on public.contracts
  for each row execute function public.set_updated_at();

create table if not exists public.contract_versions (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references public.contracts (id) on delete cascade,
  version       text not null,
  content_html  text not null default '',
  content_json  jsonb,
  is_published  boolean not null default false,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (contract_id, version)
);

-- --------------------------------------------------------------------------
-- Tabelas: alunos / matrículas / documentos / assinaturas
-- --------------------------------------------------------------------------
create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  cpf           text unique not null,
  rg            text,
  birth_date    date,
  sexo          public.sexo,
  estado_civil  public.estado_civil,
  phone         text,
  whatsapp      text,
  email         text,
  cep           text,
  street        text,
  number        text,
  complement    text,
  neighborhood  text,
  city          text,
  state         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.enrollments (
  id                   uuid primary key default gen_random_uuid(),
  enrollment_code      text unique,
  student_id           uuid not null references public.students (id) on delete cascade,
  course_id            uuid references public.courses (id) on delete set null,
  unit_id              uuid references public.units (id) on delete set null,
  turno                public.turno,
  contract_version_id  uuid references public.contract_versions (id) on delete set null,
  status               public.enrollment_status not null default 'pendente',
  accepted_terms       boolean not null default false,
  signed_at            timestamptz,
  signer_ip            text,
  pdf_path             text,
  notes                text,
  reviewed_by          uuid references auth.users (id) on delete set null,
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now()
);

create index if not exists idx_enrollments_status on public.enrollments (status);
create index if not exists idx_enrollments_created on public.enrollments (created_at desc);

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  type          public.document_type not null,
  file_path     text not null,
  file_name     text,
  mime_type     text,
  size_bytes    bigint,
  created_at    timestamptz not null default now()
);

create table if not exists public.signatures (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  method        public.signature_method not null,
  image_path    text,
  typed_name    text,
  ip            text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Número de matrícula: MAT-<ano>-<6 dígitos>
-- --------------------------------------------------------------------------
create sequence if not exists public.enrollment_seq;

create or replace function public.set_enrollment_code()
returns trigger
language plpgsql
as $$
begin
  if new.enrollment_code is null then
    new.enrollment_code :=
      'MAT-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.enrollment_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_enrollment_code on public.enrollments;
create trigger trg_set_enrollment_code
  before insert on public.enrollments
  for each row execute function public.set_enrollment_code();

-- --------------------------------------------------------------------------
-- RLS
-- --------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.user_roles          enable row level security;
alter table public.units               enable row level security;
alter table public.courses             enable row level security;
alter table public.contracts           enable row level security;
alter table public.contract_versions   enable row level security;
alter table public.students            enable row level security;
alter table public.enrollments         enable row level security;
alter table public.documents           enable row level security;
alter table public.signatures          enable row level security;

-- profiles: cada um lê/edita o próprio; admin gerencia.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- user_roles: usuário lê os próprios papéis; admin gerencia todos.
create policy "user_roles_select_own_or_admin" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_all" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- units / courses: leitura pública dos ativos; admin gerencia.
create policy "units_public_read" on public.units
  for select using (active or public.is_staff(auth.uid()));
create policy "units_admin_write" on public.units
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "courses_public_read" on public.courses
  for select using (active or public.is_staff(auth.uid()));
create policy "courses_admin_write" on public.courses
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- contracts / versions: versões publicadas legíveis publicamente; admin gerencia.
create policy "contracts_read" on public.contracts
  for select using (active or public.is_staff(auth.uid()));
create policy "contracts_admin_write" on public.contracts
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "contract_versions_read" on public.contract_versions
  for select using (is_published or public.is_staff(auth.uid()));
create policy "contract_versions_admin_write" on public.contract_versions
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Fluxo de matrícula: INSERT público (submissão final via Edge Function service role);
-- leitura/edição restritas à equipe.
create policy "students_insert_public" on public.students
  for insert with check (true);
create policy "students_staff_read" on public.students
  for select using (public.is_staff(auth.uid()));
create policy "students_staff_write" on public.students
  for update using (public.is_staff(auth.uid()));

create policy "enrollments_insert_public" on public.enrollments
  for insert with check (true);
create policy "enrollments_staff_read" on public.enrollments
  for select using (public.is_staff(auth.uid()));
create policy "enrollments_staff_update" on public.enrollments
  for update using (public.is_staff(auth.uid()));
create policy "enrollments_admin_delete" on public.enrollments
  for delete using (public.has_role(auth.uid(), 'admin'));

create policy "documents_insert_public" on public.documents
  for insert with check (true);
create policy "documents_staff_read" on public.documents
  for select using (public.is_staff(auth.uid()));

create policy "signatures_insert_public" on public.signatures
  for insert with check (true);
create policy "signatures_staff_read" on public.signatures
  for select using (public.is_staff(auth.uid()));

-- --------------------------------------------------------------------------
-- Storage buckets (privados)
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false),
       ('signatures', 'signatures', false),
       ('contracts-pdf', 'contracts-pdf', false)
on conflict (id) do nothing;

-- Upload público nos buckets do fluxo (candidato envia documentos/assinatura);
-- leitura apenas pela equipe.
create policy "storage_flow_insert" on storage.objects
  for insert with check (bucket_id in ('documents', 'signatures'));
create policy "storage_staff_read" on storage.objects
  for select using (
    bucket_id in ('documents', 'signatures', 'contracts-pdf')
    and public.is_staff(auth.uid())
  );

-- --------------------------------------------------------------------------
-- Seed — dados de exemplo
-- --------------------------------------------------------------------------
insert into public.units (name, address, city, state, phone, active) values
  ('Unidade Marabá', 'Centro', 'Marabá', 'PA', '(94) 0000-0000', true),
  ('Unidade São Domingos do Araguaia', 'Centro', 'São Domingos do Araguaia', 'PA', '(94) 0000-0000', true),
  ('Unidade Itupiranga', 'Centro', 'Itupiranga', 'PA', '(94) 0000-0000', true)
on conflict do nothing;

-- Cursos reais do Grupo Educacional Meta. Preço/carga horária ficam null aqui
-- (configurados depois no painel admin) para não inserir valores fictícios.
insert into public.courses (name, slug, description, turnos, active) values
  ('Informática Infantil — Aprendendo Brincando', 'informatica-infantil', 'Informática para crianças, aprendendo de forma lúdica.', '{manha,tarde}', true),
  ('Agente Comunitário de Saúde — Formação Completa', 'agente-comunitario-saude', 'Formação completa para atuação como agente comunitário de saúde.', '{manha,noite}', true),
  ('Informática Avançada', 'informatica-avancada', 'Aprofundamento em ferramentas e produtividade.', '{noite}', true),
  ('Informática Básica', 'informatica-basica', 'Fundamentos de informática para o dia a dia e o trabalho.', '{manha,tarde,noite}', true),
  ('Auxiliar Administrativo', 'auxiliar-administrativo', 'Rotinas administrativas e atendimento.', '{manha,tarde,noite}', true),
  ('Atendente de Farmácia', 'atendente-farmacia', 'Atendimento e rotinas em farmácia.', '{tarde,noite}', true),
  ('Operador de Caixa', 'operador-caixa', 'Operação de caixa e atendimento no comércio.', '{manha,noite}', true)
on conflict (slug) do nothing;

-- Contrato modelo + versão publicada inicial.
with c as (
  insert into public.contracts (title, description, active)
  values ('Contrato de Prestação de Serviços Educacionais', 'Contrato padrão de matrícula.', true)
  returning id
)
insert into public.contract_versions (contract_id, version, content_html, is_published)
select c.id, '1.0',
  '<h1>Contrato de Prestação de Serviços Educacionais</h1>' ||
  '<p>Pelo presente instrumento, o(a) ALUNO(A) e o GRUPO EDUCACIONAL META acordam os termos abaixo.</p>' ||
  '<h2>1. Objeto</h2><p>Prestação de serviços educacionais no curso selecionado no ato da matrícula.</p>' ||
  '<h2>2. Mensalidade</h2><p>O valor e a duração são os indicados na matrícula.</p>' ||
  '<h2>3. Aceite</h2><p>A assinatura digital confirma a leitura e a concordância integral com este contrato.</p>',
  true
from c;
