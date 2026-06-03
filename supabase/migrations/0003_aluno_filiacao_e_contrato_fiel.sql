-- =============================================================================
-- (a) Campos de filiação/naturalidade do aluno (exigidos pelo contrato).
-- (b) Conteúdo do contrato v1.0 transcrito FIEL ao original enviado pela escola
--     (mantém o texto exatamente, inclusive "fins educacionais" e "Magalhães baeta").
-- =============================================================================

alter table public.students
  add column if not exists naturalidade text,
  add column if not exists father_name  text,
  add column if not exists mother_name  text;

update public.contract_versions
set content_html = $html$
<h2>CONTRATO DE PRESTAÇÃO DO CURSO DE: {{curso}}</h2>

<p>
<strong>ALUNO:</strong> {{aluno_nome}}<br/>
<strong>CPF:</strong> {{cpf}} &nbsp;&nbsp; <strong>RG:</strong> {{rg}}<br/>
<strong>DATA NASCIMENTO:</strong> {{data_nascimento}} &nbsp;&nbsp; <strong>NATURALIDADE:</strong> {{naturalidade}} &nbsp;&nbsp; <strong>ESTADO CIVIL:</strong> {{estado_civil}}<br/>
<strong>ENDEREÇO — RUA:</strong> {{endereco_rua}}<br/>
<strong>BAIRRO:</strong> {{endereco_bairro}} &nbsp;&nbsp; <strong>CIDADE:</strong> {{endereco_cidade}}<br/>
<strong>TELEFONE:</strong> {{telefone}}<br/>
<strong>PAI:</strong> {{pai}}<br/>
<strong>MÃE:</strong> {{mae}}<br/>
<strong>E-MAIL:</strong> {{email}}
</p>

<p><strong>Cláusula 1ª FORMA DE PAGAMENTO:</strong> Uma taxa de matrícula no valor de R$ {{valor_matricula}} que será pago no ato da matrícula e mais {{num_mensalidades}} mensalidades no valor de R$ {{valor_mensalidade}} com vencimento das mensalidades até o dia 10 de cada mês.</p>

<p><strong>Cláusula 2ª</strong> O GRUPO EDUCACIONAL META – inscrito no C.N.P.J Sob o Nº 30.540.920/0001-63 com sede na Avenida Magalhães baeta nº 08, São felix, Marabá-PA compromete-se a ministrar o curso de: {{curso}}</p>

<p><strong>Cláusula 3ª</strong> O CURSO de {{curso}} tem a duração de {{duracao}}</p>

<p><strong>Cláusula 4ª UNIFORME:</strong> Visando a identificação e segurança do aluno, será obrigatório o uso do uniforme.</p>

<p><strong>Cláusula 5ª USO DE TELEFONE:</strong> Proibido o uso de aparelhos eletrônicos portáteis, com fins educacionais, em sala de aula ou quaisquer outros ambientes em que estejam sendo desenvolvidas atividades educacionais.</p>

<p><strong>CERTIFICADO DE CONCLUSÃO</strong> – Internamente grátis ao final curso.</p>

<p><strong>Cláusula 6ª REPOSIÇÃO DE AULA:</strong> Será feita mediante apresentação de atestado médico em caso de problemas de saúde. Em outros casos, só será feita mediante justificativa plausível.</p>

<p><strong>Cláusula 7ª</strong> O contratante poderá CANCELAR o curso mediante pagamento de uma multa no valor de 3 (três) mensalidades no valor de R$ {{valor_mensalidade}} e comunicação por escrito além de estar em dia com suas mensalidades, caso não faça com que seja considerado inadimplente e poderá ter seu nome negativado no SPC (Sistema de Proteção ao Crédito).</p>

<p>RECEBEMOS R$ {{valor_matricula}}<br/>REFERENTE À MATRÍCULA</p>

<p>Marabá-PA, {{data}}</p>
$html$
where version = '1.0';
