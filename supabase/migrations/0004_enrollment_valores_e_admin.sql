-- =============================================================================
-- (a) Campos financeiros da matrícula (preenchidos pelo responsável da escola).
-- (b) Concede papel admin ao primeiro usuário da equipe, se já existir no Auth.
-- =============================================================================

alter table public.enrollments
  add column if not exists valor_matricula   numeric(10, 2),
  add column if not exists num_mensalidades  integer,
  add column if not exists valor_mensalidade numeric(10, 2),
  add column if not exists valor_multa       numeric(10, 2),
  add column if not exists recebedor         text,
  add column if not exists valor_recebido    numeric(10, 2),
  add column if not exists responsavel_id    uuid references auth.users (id) on delete set null;

do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'grupometapa@gmail.com';
  if v_uid is null then
    raise notice 'ADMIN: usuario grupometapa@gmail.com ainda NAO existe no Auth';
  else
    insert into public.profiles (id, email) values (v_uid, 'grupometapa@gmail.com')
      on conflict (id) do nothing;
    insert into public.user_roles (user_id, role) values (v_uid, 'admin')
      on conflict (user_id, role) do nothing;
    raise notice 'ADMIN concedido a % (grupometapa@gmail.com)', v_uid;
  end if;
end $$;
