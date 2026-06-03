-- =============================================================================
-- Conteúdo real do contrato (Grupo Educacional Meta) — versão 1.0.
-- Substitui o placeholder semeado em 0001. Usa tokens {{campo}} para os dados
-- do aluno/curso/valores, preenchidos no momento da assinatura.
-- =============================================================================

update public.contract_versions
set content_html = $html$
<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h2>
<p><strong>Curso:</strong> {{curso}}</p>

<h3>Dados do(a) aluno(a)</h3>
<p>
<strong>Aluno(a):</strong> {{aluno_nome}}<br/>
<strong>CPF:</strong> {{cpf}} &nbsp;&nbsp; <strong>RG:</strong> {{rg}}<br/>
<strong>Data de nascimento:</strong> {{data_nascimento}} &nbsp;&nbsp; <strong>Naturalidade:</strong> {{naturalidade}} &nbsp;&nbsp; <strong>Estado civil:</strong> {{estado_civil}}<br/>
<strong>Endereço:</strong> {{endereco_rua}} &nbsp;&nbsp; <strong>Bairro:</strong> {{endereco_bairro}} &nbsp;&nbsp; <strong>Cidade:</strong> {{endereco_cidade}}<br/>
<strong>Telefone:</strong> {{telefone}}<br/>
<strong>Pai:</strong> {{pai}}<br/>
<strong>Mãe:</strong> {{mae}}<br/>
<strong>E-mail:</strong> {{email}}
</p>

<h3>Cláusulas</h3>

<p><strong>Cláusula 1ª — Forma de pagamento:</strong> Uma taxa de matrícula no valor de R$ {{valor_matricula}}, que será paga no ato da matrícula, e mais {{num_mensalidades}} mensalidades no valor de R$ {{valor_mensalidade}}, com vencimento das mensalidades até o dia 10 de cada mês.</p>

<p><strong>Cláusula 2ª:</strong> O GRUPO EDUCACIONAL META, inscrito no C.N.P.J. sob o nº 30.540.920/0001-63, com sede na Avenida Magalhães Barata, nº 08, São Félix, Marabá-PA, compromete-se a ministrar o curso de: {{curso}}.</p>

<p><strong>Cláusula 3ª:</strong> O curso de {{curso}} tem a duração de {{duracao}}.</p>

<p><strong>Cláusula 4ª — Uniforme:</strong> Visando à identificação e à segurança do aluno, será obrigatório o uso do uniforme.</p>

<p><strong>Cláusula 5ª — Uso de telefone:</strong> Proibido o uso de aparelhos eletrônicos portáteis, com fins não educacionais, em sala de aula ou em quaisquer outros ambientes em que estejam sendo desenvolvidas atividades educacionais.</p>

<p><strong>Certificado de conclusão:</strong> Internamente grátis ao final do curso.</p>

<p><strong>Cláusula 6ª — Reposição de aula:</strong> Será feita mediante apresentação de atestado médico em caso de problemas de saúde. Em outros casos, só será feita mediante justificativa plausível.</p>

<p><strong>Cláusula 7ª — Cancelamento:</strong> O contratante poderá cancelar o curso mediante pagamento de uma multa no valor de 3 (três) mensalidades, no valor de R$ {{valor_mensalidade}}, e comunicação por escrito, além de estar em dia com suas mensalidades. Caso não o faça, será considerado inadimplente e poderá ter seu nome negativado no SPC (Sistema de Proteção ao Crédito).</p>

<p>Recebemos R$ {{valor_matricula}} referente à matrícula.</p>

<p>Marabá-PA, {{data}}.</p>
$html$
where version = '1.0';
