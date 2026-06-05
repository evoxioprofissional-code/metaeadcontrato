-- Permite à equipe excluir/gerenciar arquivos nos buckets privados
-- (ex.: remover documentos/assinaturas pelo painel).
create policy "storage_staff_delete" on storage.objects
  for delete using (
    bucket_id in ('documents', 'signatures', 'contracts-pdf')
    and public.is_staff(auth.uid())
  );

create policy "storage_staff_update" on storage.objects
  for update using (
    bucket_id in ('documents', 'signatures', 'contracts-pdf')
    and public.is_staff(auth.uid())
  );
