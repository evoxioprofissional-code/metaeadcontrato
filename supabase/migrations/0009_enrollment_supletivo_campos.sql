-- Campos específicos do contrato Supletivo (preenchidos pelo responsável).
alter table public.enrollments
  add column if not exists apos_vencimento numeric(10, 2),
  add column if not exists camisa text;
