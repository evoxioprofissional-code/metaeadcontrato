-- =============================================================================
-- Segundo contrato: SUPLETIVO (Ensino Médio). Multi-contrato — o responsável
-- escolhe qual aplicar. Transcrição do scan enviado pela escola.
-- ATENÇÃO: scan em baixa resolução; cláusulas marcadas para revisão do dono.
-- Tokens {{...}} preenchidos com dados do aluno + valores do responsável.
-- =============================================================================

with c as (
  insert into public.contracts (title, description, active)
  values ('Contrato de Prestação de Serviços — Supletivo (Ensino Médio)',
          'Contrato do curso Supletivo / Ensino Médio.', true)
  returning id
)
insert into public.contract_versions (contract_id, version, content_html, is_published)
select c.id, '1.0', $html$
<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DO CURSO: SUPLETIVO (ENSINO MÉDIO)</h2>

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

<p>Por este instrumento de garantia e compromisso mútuo estabelecido entre o ALUNO acima citado e o GRUPO EDUCACIONAL META, doravante denominado CONTRATADA, estabelece-se o seguinte:</p>

<p><strong>Cláusula 1ª</strong> — A CONTRATANTE contrata a CONTRATADA para a realização do curso SUPLETIVO (Ensino Médio).</p>
<p><strong>Cláusula 2ª</strong> — A CONTRATADA cumprirá a prestação de serviços em sua totalidade, oferecendo ao CONTRATANTE as condições para concluir e efetivar este contrato, ficando o CONTRATANTE obrigado a cumprir todos os processos formativos do presente contrato.</p>
<p><strong>Cláusula 3ª</strong> — As parcelas não correspondem a meses letivos, devendo, pois, serem pagas mensalmente. [conferir]</p>
<p><strong>Cláusula 4ª</strong> — O CONTRATANTE compromete-se a pagar as parcelas/mensalidades do curso em dia; em caso de atraso será cobrado juros e multa no valor indicado acima ("Após o vencimento"). Persistindo a inadimplência, o nome poderá ser incluído no SPC/SERASA, nos termos do art. 43 da Lei 8.078/90. [conferir]</p>
<p><strong>Cláusula 5ª</strong> — No caso de rescisão/desistência do presente contrato, o aluno deverá assinar o TERMO DE RESCISÃO CONTRATUAL, devendo pagar o valor de 03 (três) mensalidades, independentemente do mês em que ocorrer a rescisão, além das parcelas em atraso. [conferir]</p>
<p><strong>Cláusula 6ª</strong> — O não cancelamento formal do presente contrato não suspende os vencimentos das parcelas subsequentes, ficando a CONTRATADA autorizada a prosseguir com a cobrança, independentemente de qualquer notificação. [conferir]</p>
<p><strong>Cláusula 7ª</strong> — O CONTRATANTE que obtiver nota inferior a 7,0 ou frequência menor que 85% nos módulos será reprovado; para realizar nova avaliação deverá pagar a taxa de 01 (uma) mensalidade para cada disciplina reprovada, para que haja recuperação. [conferir]</p>
<p><strong>Cláusula 8ª</strong> — Serão por conta do CONTRATANTE os custos de deslocamento e alimentação na execução das aulas. [conferir]</p>
<p><strong>Cláusula 9ª</strong> — O CONTRATANTE que não estiver em dia com os pagamentos das mensalidades não terá permitida a execução das aulas. [conferir]</p>
<p><strong>Cláusula 10ª</strong> — A CONTRATADA reserva-se o direito de não oferecer a turma caso não seja atingido o número mínimo de 20 alunos. [conferir]</p>
<p><strong>Cláusula 11ª</strong> — Para receber o certificado do curso, o CONTRATANTE deverá cumprir todos os requisitos de documentação estabelecidos pela CONTRATADA. [conferir]</p>
<p><strong>Cláusula 12ª</strong> — O CONTRATANTE deverá cumprir todas as exigências educacionais impostas pela DIREÇÃO/COORDENAÇÃO durante a execução das aulas; em caso de desobediência, a COORDENAÇÃO/DIREÇÃO poderá expulsar o aluno, sem nenhum ônus à CONTRATADA. [conferir]</p>
<p><strong>Cláusula 13ª</strong> — O CONTRATANTE deverá observar princípios, comportamento e condutas éticas, morais e disciplinares, obedecendo às normas de boa convivência coletiva; a qualquer momento a COORDENAÇÃO/DIREÇÃO/ADMINISTRAÇÃO da CONTRATADA poderá aplicar a EXPULSÃO, sem nenhum ônus à CONTRATADA. [conferir]</p>
<p><strong>Cláusula 14ª</strong> — O CONTRATANTE autoriza o uso de sua imagem em todo e qualquer material (fotos e documentos) para ser utilizado em marketing da CONTRATADA, em canais de comunicação e redes sociais.</p>
<p><strong>Cláusula 15ª</strong> — Durante as aulas o CONTRATANTE deverá utilizar trajes de acordo com o padrão imposto pela CONTRATADA, ficando a cargo da CONTRATADA a decisão de liberação de trajes nos casos em que achar necessário. [conferir]</p>
<p><strong>Cláusula 16ª</strong> — O CONTRATANTE declara que todas as informações apresentadas à CONTRATADA na ficha de matrícula são verídicas e de sua inteira responsabilidade.</p>
<p><strong>Cláusula 17ª</strong> — O contrato terá um período de 5 (cinco) meses após o término do curso para sanar todas as pendências administrativas e/ou financeiras; caso contrário, será invalidado o período de tempo já cumprido. [conferir]</p>

<p>Marabá-PA, {{data}}.</p>

<p>GRUPO EDUCACIONAL META — CNPJ 30.540.920/0001-63</p>
$html$, true
from c;
