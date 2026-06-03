-- Acrescenta a linha RECEBEDOR (campo do responsável) ao contrato v1.0,
-- logo após "RECEBEMOS R$ ... REFERENTE À MATRÍCULA".
update public.contract_versions
set content_html = replace(
  content_html,
  '<p>RECEBEMOS R$ {{valor_matricula}}<br/>REFERENTE À MATRÍCULA</p>',
  '<p>RECEBEMOS R$ {{valor_matricula}}<br/>REFERENTE À MATRÍCULA<br/>RECEBEDOR: {{recebedor}}</p>'
)
where version = '1.0';
