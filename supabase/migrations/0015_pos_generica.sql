-- Torna o contrato de Pós-Graduação genérico: a área vira o token {{pos_area}},
-- preenchido pelo responsável/dono. Adiciona coluna pos_area e atualiza as RPCs.

alter table public.enrollments add column if not exists pos_area text;
alter table public.enrollment_invites add column if not exists pos_area text;

-- Conteúdo genérico (clausula 1 usa {{pos_area}}).
update public.contract_versions cv
set content_html = $html$
<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇO DO CURSO: PÓS-GRADUAÇÃO</h2>

<p>
<strong>ALUNO:</strong> {{aluno_nome}}<br/>
<strong>CPF:</strong> {{cpf}} &nbsp;&nbsp; <strong>RG:</strong> {{rg}} &nbsp;&nbsp; <strong>ESTADO CIVIL:</strong> {{estado_civil}}<br/>
<strong>DATA NASCIMENTO:</strong> {{data_nascimento}} &nbsp;&nbsp; <strong>NATURALIDADE:</strong> {{naturalidade}}<br/>
<strong>ENDEREÇO — RUA:</strong> {{endereco_rua}}<br/>
<strong>BAIRRO:</strong> {{endereco_bairro}} &nbsp;&nbsp; <strong>CIDADE:</strong> {{endereco_cidade}}<br/>
<strong>TELEFONE:</strong> {{telefone}}<br/>
<strong>PAI:</strong> {{pai}}<br/>
<strong>MÃE:</strong> {{mae}}<br/>
<strong>E-MAIL:</strong> {{email}}
</p>

<p>
<strong>VALOR DA MATRÍCULA:</strong> R$ {{valor_matricula}} &nbsp;&nbsp; <strong>Vencimento das parcelas:</strong> dia 10 de cada mês.<br/>
<strong>{{num_mensalidades}} mensalidades de:</strong> R$ {{valor_mensalidade}} &nbsp;&nbsp; <strong>Após o vencimento:</strong> R$ {{apos_vencimento}}<br/>
<strong>Camisa:</strong> {{camisa}}
</p>

<h3>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h3>

<p>Por este instrumento de garantia e compromisso mútuo estabelecido entre o ALUNO citado agora doravante CONTRATANTE e o GRUPO EDUCACIONAL META doravante agora denominada de CONTRATADA, estabelece o seguinte:</p>

<p><strong>Cláusula 1ª</strong> - O CONTRATANTE contrata à CONTRATADA para realização de CURSO DE PÓS GRADUAÇÃO EM {{pos_area}}.</p>
<p><strong>Cláusula 2ª</strong> - A CONTRATADA cabe à prestação de serviços em sua totalidade, oferecendo ao CONTRATANTE, condições para concluir o objetivo deste contrato, ficando o CONTRATANTE a cumprir todos os processos formativos do presente contrato.</p>
<p><strong>Cláusula 3ª</strong> - As parcelas mensais não correspondem a meses letivos, devendo, pois, serem pagas ininterruptamente.</p>
<p><strong>Cláusula 4ª</strong> - O CONTRATANTE compromete-se a pagar as parcelas as mensalidades do curso em dia, em caso de atraso será cobrado os juros na proporção de 2% ao dia e multa no valor da 250,00. Caso haja inadimplência das parcelas será comunicado o fato ao SPC/SERASA, nos termos do artigo 43, inciso 2° da LEI 8.078/90.</p>
<p><strong>Cláusula 5ª</strong> - No caso de rescisão ou distrato do presente contrato fica estabelecido, que o aluno deverá assinar o TERMO DE RESCISÃO CONTRATUAL, devendo pagar valores de 03 (três) mensalidades independentes do mês que ocorreu a rescisão, e ainda, pagar as parcelas em atraso sem nenhum outro ônus e sem devolução do dinheiro já pago do CONTRATANTE à Instituição de Ensino.</p>
<p><strong>Cláusula 6ª</strong> - O não cancelamento expresso do presente contrato, não suspenderá os vencimentos das parcelas subsequentes, sendo assim a CONTRATADA ficará autorizada a promover a cobrança judicial (SPC) ou extrajudicial independentemente de qualquer interpelação.</p>
<p><strong>Cláusula 7ª</strong> - O CONTRATANTE no caso em que obtiver notas abaixo de 7.0 ou frequência menor que 85% nos módulos será reprovado, o aluno que não justificar suas faltas para realizar uma nova avaliação deverá pagar a taxa de 01 (uma) mensalidade, para cada disciplina reprovada para que haja reavaliação.</p>
<p><strong>Cláusula 8ª</strong> - Será por conta do CONTRATANTE o custo de deslocamento e alimentação na execução das aulas teórica e práticas.</p>
<p><strong>Cláusula 9ª</strong> - O CONTRATANTE que não estiver em dia com os pagamentos das mensalidades não será permitida a execução das AULAS, após pagamento do débito poderá retomar suas aulas.</p>
<p><strong>Cláusula 10ª</strong> - A CONTRATADA reserva-se o direito de não oferecer o programa de ensino caso o número mínimo de alunos não seja atingido o mínimo de 20 alunos.</p>
<p><strong>Cláusula 11ª</strong> - Para receber a certificação do curso o CONTRATANTE declara cumprir todos os requisitos de documentação e educacionais estabelecidos pela CONTRATADA.</p>
<p><strong>Cláusula 12ª</strong> - O CONTRATANTE deverá executar todas as exigências educacionais, impostas pela DIREÇÃO, COORDENAÇÃO durante a execução das aulas, no caso de desobediência, à COORDENAÇÃO e/ou DIREÇÃO poderá expulsar o aluno, sem nenhum ônus a CONTRATADA.</p>
<p><strong>Cláusula 13ª</strong> - O CONTRATANTE deverá observar os princípios, comportamento e conduta éticos, morais, disciplinares e de respeito às normas de boa convivência coletiva e a qualquer integrante da COORDENAÇÃO, DIREÇÃO e ADMINISTRAÇÃO da CONTRATADA, sob pena de EXPULSÃO pela COORDENAÇÃO ou DIREÇÃO sem nenhum ônus a CONTRATADA.</p>
<p><strong>Cláusula 14ª</strong> - O CONTRATANTE autoriza o uso da sua imagem em todo e qualquer material entre fotos e documentos, para ser utilizado em Marketing da CONTRATADA em canais de comunicação e redes sociais.</p>
<p><strong>Cláusula 15ª</strong> - O CONTRATANTE no local e durante as aulas deverá utilizar trajes de acordo ao padrão impostos pela CONTRATADA, ficando a cargo da CONTRATADA a decisão de liberação do padrão nos casos em que achar necessário.</p>
<p><strong>Cláusula 16ª</strong> - O CONTRATANTE declara que todas as informações apresentadas a CONTRATADA na ficha de matrícula são verídicas e de inteira responsabilidade do CONTRATANTE.</p>
<p><strong>Cláusula 17ª</strong> - O CONTRATANTE terá um período de 45 (quarenta e cinco) dias após o termino do curso para sanar todas as pendências administrativa e/ou financeira, caso contrário será invalidado o período do tempo já cursado.</p>
<p><strong>Cláusula 18ª</strong> - As despesas da colação de grau como fotografias, filmagens, canudos, becas, é de inteira responsabilidade dos formandos.</p>
<p><strong>Cláusula 19ª</strong> - Será eleito o Fórum desta cidade, para dirimir quaisquer dúvidas, renunciando a qualquer outro por mais especial que seja.</p>

<p>MARABÁ-PA, {{data}}.</p>

<p>ALUNO (LI E ESTOU DE ACORDO) &nbsp;&nbsp;|&nbsp;&nbsp; GRUPO EDUCACIONAL META — CNPJ: 30.540.920/0001-63</p>
$html$
from public.contracts c
where cv.contract_id = c.id and c.title like '%Psicopedagogia%';

update public.contracts
set title = 'Contrato de Prestação de Serviços — Pós-Graduação',
    description = 'Contrato de Pós-Graduação (a área é preenchida na matrícula).'
where title like '%Psicopedagogia%';

-- get_invite passa a retornar pos_area.
create or replace function public.get_invite(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'token', i.token,
    'contract_version_id', i.contract_version_id,
    'contract_html', cv.content_html,
    'contract_version', cv.version,
    'contract_title', c.title,
    'course_id', i.course_id, 'course_name', co.name, 'course_slug', co.slug,
    'unit_id', i.unit_id, 'unit_name', u.name, 'turno', i.turno,
    'valor_matricula', i.valor_matricula, 'num_mensalidades', i.num_mensalidades,
    'valor_mensalidade', i.valor_mensalidade, 'apos_vencimento', i.apos_vencimento,
    'camisa', i.camisa, 'recebedor', i.recebedor, 'duracao', i.duracao,
    'pos_area', i.pos_area
  )
  from public.enrollment_invites i
  left join public.contract_versions cv on cv.id = i.contract_version_id
  left join public.contracts c on c.id = cv.contract_id
  left join public.courses co on co.id = i.course_id
  left join public.units u on u.id = i.unit_id
  where i.token = p_token and i.status = 'pendente';
$$;
grant execute on function public.get_invite(uuid) to anon, authenticated;

-- submit_remote_enrollment passa a gravar pos_area.
create or replace function public.submit_remote_enrollment(
  p_token uuid, p_student jsonb, p_signature jsonb, p_documents jsonb, p_ip text, p_user_agent text
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_inv public.enrollment_invites;
  v_student_id uuid;
  v_enr_id uuid;
  v_code text;
  d jsonb;
begin
  select * into v_inv from public.enrollment_invites where token = p_token and status = 'pendente';
  if not found then raise exception 'Convite inválido ou já utilizado'; end if;

  insert into public.students (
    full_name, cpf, rg, birth_date, sexo, estado_civil, naturalidade,
    father_name, mother_name, phone, whatsapp, email,
    cep, street, number, complement, neighborhood, city, state
  ) values (
    p_student->>'full_name', p_student->>'cpf', p_student->>'rg',
    nullif(p_student->>'birth_date','')::date, nullif(p_student->>'sexo','')::public.sexo,
    nullif(p_student->>'estado_civil','')::public.estado_civil, p_student->>'naturalidade',
    p_student->>'father_name', p_student->>'mother_name', p_student->>'phone',
    p_student->>'whatsapp', p_student->>'email', p_student->>'cep', p_student->>'street',
    p_student->>'number', nullif(p_student->>'complement',''), p_student->>'neighborhood',
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
    student_id, course_id, unit_id, turno, contract_version_id, status, accepted_terms,
    signed_at, signer_ip, valor_matricula, num_mensalidades, valor_mensalidade,
    apos_vencimento, camisa, pos_area, valor_recebido, recebedor, responsavel_id
  ) values (
    v_student_id, v_inv.course_id, v_inv.unit_id, v_inv.turno, v_inv.contract_version_id, 'pendente', true,
    now(), p_ip, v_inv.valor_matricula, v_inv.num_mensalidades, v_inv.valor_mensalidade,
    v_inv.apos_vencimento, v_inv.camisa, v_inv.pos_area, v_inv.valor_matricula, v_inv.recebedor, v_inv.created_by
  )
  returning id, enrollment_code into v_enr_id, v_code;

  if p_documents is not null then
    for d in select * from jsonb_array_elements(p_documents) loop
      insert into public.documents (enrollment_id, type, file_path, file_name, mime_type, size_bytes)
      values (v_enr_id, (d->>'type')::public.document_type, d->>'file_path', d->>'file_name',
              d->>'mime_type', nullif(d->>'size_bytes','')::bigint);
    end loop;
  end if;

  insert into public.signatures (enrollment_id, method, image_path, typed_name, ip, user_agent)
  values (v_enr_id, (p_signature->>'method')::public.signature_method, p_signature->>'image_path',
          p_signature->>'typed_name', p_ip, p_user_agent);

  update public.enrollment_invites set status = 'usada', enrollment_id = v_enr_id where id = v_inv.id;
  return v_code;
end;
$$;
grant execute on function public.submit_remote_enrollment(uuid, jsonb, jsonb, jsonb, text, text) to anon, authenticated;
