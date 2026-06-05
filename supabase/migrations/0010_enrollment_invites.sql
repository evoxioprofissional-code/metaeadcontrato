-- =============================================================================
-- Fluxo remoto por link: o responsável cria um "convite" (contrato + valores)
-- e envia um link; o aluno (anônimo) abre, preenche, assina e finaliza.
-- =============================================================================

create table if not exists public.enrollment_invites (
  id                  uuid primary key default gen_random_uuid(),
  token               uuid not null unique default gen_random_uuid(),
  contract_version_id uuid references public.contract_versions (id) on delete set null,
  course_id           uuid references public.courses (id) on delete set null,
  unit_id             uuid references public.units (id) on delete set null,
  turno               public.turno,
  valor_matricula     numeric(10, 2),
  num_mensalidades    integer,
  valor_mensalidade   numeric(10, 2),
  apos_vencimento     numeric(10, 2),
  camisa              text,
  recebedor           text,
  duracao             text,
  status              text not null default 'pendente',
  enrollment_id       uuid references public.enrollments (id) on delete set null,
  created_by          uuid references auth.users (id) on delete set null,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz
);

alter table public.enrollment_invites enable row level security;

-- Equipe cria/gerencia convites.
create policy "invites_staff_all" on public.enrollment_invites
  for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- --------------------------------------------------------------------------
-- RPC: aluno carrega o convite pelo token (sem expor a tabela inteira).
-- --------------------------------------------------------------------------
create or replace function public.get_invite(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'token', i.token,
    'contract_version_id', i.contract_version_id,
    'contract_html', cv.content_html,
    'contract_version', cv.version,
    'contract_title', c.title,
    'course_id', i.course_id,
    'course_name', co.name,
    'course_slug', co.slug,
    'unit_id', i.unit_id,
    'unit_name', u.name,
    'turno', i.turno,
    'valor_matricula', i.valor_matricula,
    'num_mensalidades', i.num_mensalidades,
    'valor_mensalidade', i.valor_mensalidade,
    'apos_vencimento', i.apos_vencimento,
    'camisa', i.camisa,
    'recebedor', i.recebedor,
    'duracao', i.duracao
  )
  from public.enrollment_invites i
  left join public.contract_versions cv on cv.id = i.contract_version_id
  left join public.contracts c on c.id = cv.contract_id
  left join public.courses co on co.id = i.course_id
  left join public.units u on u.id = i.unit_id
  where i.token = p_token and i.status = 'pendente';
$$;

grant execute on function public.get_invite(uuid) to anon, authenticated;

-- --------------------------------------------------------------------------
-- RPC: aluno finaliza a matrícula remota (cria aluno + matrícula + docs +
-- assinatura, marca o convite como usado e retorna o nº gerado).
-- Arquivos já foram enviados ao Storage pelo cliente (paths em p_documents/p_signature).
-- --------------------------------------------------------------------------
create or replace function public.submit_remote_enrollment(
  p_token       uuid,
  p_student     jsonb,
  p_signature   jsonb,
  p_documents   jsonb,
  p_ip          text,
  p_user_agent  text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv        public.enrollment_invites;
  v_student_id uuid;
  v_enr_id     uuid;
  v_code       text;
  d            jsonb;
begin
  select * into v_inv from public.enrollment_invites where token = p_token and status = 'pendente';
  if not found then
    raise exception 'Convite inválido ou já utilizado';
  end if;

  insert into public.students (
    full_name, cpf, rg, birth_date, sexo, estado_civil, naturalidade,
    father_name, mother_name, phone, whatsapp, email,
    cep, street, number, complement, neighborhood, city, state
  ) values (
    p_student->>'full_name', p_student->>'cpf', p_student->>'rg',
    nullif(p_student->>'birth_date','')::date,
    nullif(p_student->>'sexo','')::public.sexo,
    nullif(p_student->>'estado_civil','')::public.estado_civil,
    p_student->>'naturalidade', p_student->>'father_name', p_student->>'mother_name',
    p_student->>'phone', p_student->>'whatsapp', p_student->>'email',
    p_student->>'cep', p_student->>'street', p_student->>'number',
    nullif(p_student->>'complement',''), p_student->>'neighborhood',
    p_student->>'city', p_student->>'state'
  )
  on conflict (cpf) do update set
    full_name = excluded.full_name, rg = excluded.rg, birth_date = excluded.birth_date,
    sexo = excluded.sexo, estado_civil = excluded.estado_civil, naturalidade = excluded.naturalidade,
    father_name = excluded.father_name, mother_name = excluded.mother_name,
    phone = excluded.phone, whatsapp = excluded.whatsapp, email = excluded.email,
    cep = excluded.cep, street = excluded.street, number = excluded.number,
    complement = excluded.complement, neighborhood = excluded.neighborhood,
    city = excluded.city, state = excluded.state
  returning id into v_student_id;

  insert into public.enrollments (
    student_id, course_id, unit_id, turno, contract_version_id, status,
    accepted_terms, signed_at, signer_ip, valor_matricula, num_mensalidades,
    valor_mensalidade, apos_vencimento, camisa, valor_recebido, recebedor, responsavel_id
  ) values (
    v_student_id, v_inv.course_id, v_inv.unit_id, v_inv.turno, v_inv.contract_version_id, 'pendente',
    true, now(), p_ip, v_inv.valor_matricula, v_inv.num_mensalidades,
    v_inv.valor_mensalidade, v_inv.apos_vencimento, v_inv.camisa, v_inv.valor_matricula,
    v_inv.recebedor, v_inv.created_by
  )
  returning id, enrollment_code into v_enr_id, v_code;

  if p_documents is not null then
    for d in select * from jsonb_array_elements(p_documents) loop
      insert into public.documents (enrollment_id, type, file_path, file_name, mime_type, size_bytes)
      values (v_enr_id, (d->>'type')::public.document_type, d->>'file_path',
              d->>'file_name', d->>'mime_type', nullif(d->>'size_bytes','')::bigint);
    end loop;
  end if;

  insert into public.signatures (enrollment_id, method, image_path, typed_name, ip, user_agent)
  values (v_enr_id, (p_signature->>'method')::public.signature_method,
          p_signature->>'image_path', p_signature->>'typed_name', p_ip, p_user_agent);

  update public.enrollment_invites set status = 'usada', enrollment_id = v_enr_id where id = v_inv.id;
  return v_code;
end;
$$;

grant execute on function public.submit_remote_enrollment(uuid, jsonb, jsonb, jsonb, text, text) to anon, authenticated;
