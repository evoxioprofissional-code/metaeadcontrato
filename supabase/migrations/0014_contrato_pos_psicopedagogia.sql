-- Quinto contrato: PÓS-GRADUAÇÃO EM PSICOPEDAGOGIA (texto fiel enviado pela escola).
with c as (
  insert into public.contracts (title, description, active)
  values ('Contrato de Prestação de Serviços — Pós-Graduação em Psicopedagogia',
          'Contrato do curso de Pós-Graduação em Psicopedagogia.', true)
  returning id
)
insert into public.contract_versions (contract_id, version, content_html, is_published)
select c.id, '1.0', $html$
<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇO DO CURSO: PÓS-GRADUAÇÃO EM PSICOPEDAGOGIA</h2>

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

<p><strong>Cláusula 1ª</strong> - O CONTRATANTE contrata à CONTRATADA para realização de CURSO DE PÓS GRADUAÇÃO EM PSICOPEDAGOGIA.</p>
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
$html$, true
from c;
