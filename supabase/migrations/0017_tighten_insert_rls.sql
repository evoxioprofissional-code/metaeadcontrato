-- Segurança: remove INSERT público direto (anti-spam). O fluxo presencial usa
-- sessão de staff; o fluxo remoto usa submit_remote_enrollment (SECURITY DEFINER,
-- que ignora RLS). Logo, INSERT direto só precisa ser permitido para a equipe.

drop policy if exists "students_insert_public" on public.students;
drop policy if exists "enrollments_insert_public" on public.enrollments;
drop policy if exists "documents_insert_public" on public.documents;
drop policy if exists "signatures_insert_public" on public.signatures;

create policy "students_staff_insert" on public.students
  for insert with check (public.is_staff(auth.uid()));
create policy "enrollments_staff_insert" on public.enrollments
  for insert with check (public.is_staff(auth.uid()));
create policy "documents_staff_insert" on public.documents
  for insert with check (public.is_staff(auth.uid()));
create policy "signatures_staff_insert" on public.signatures
  for insert with check (public.is_staff(auth.uid()));
