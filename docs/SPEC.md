# Especificação — Grupo Educacional Meta · Matrícula Online + Contrato

Sistema web **PREMIUM** de matrícula online para escola de cursos profissionalizantes.
Padrão de SaaS moderno 2025 (Stripe/Notion/Linear/Framer/Vercel/Raycast). Deve parecer um
software de **+R$ 20.000**.

## Requisito crítico — MOBILE FIRST
Uso principal por **celular**. O mobile **não** é adaptação do desktop: desenvolver primeiro
mobile, depois desktop. Deve funcionar perfeitamente em iPhone, Android e Tablets, parecendo um
**app nativo**: botões/campos grandes, espaçamento confortável, navegação por etapas, barra de
progresso fixa, teclado adequado por campo, máscaras automáticas, autosave, animações suaves.
Tabelas viram **cards responsivos** no celular. Lighthouse Mobile **95+**. Sem quebra em
320/375/390/414/768/1024/1440.

## Landing page
Hero com logo, título "Faça sua matrícula online em poucos minutos", subtítulo
"Preencha seus dados, assine digitalmente e garanta sua vaga sem sair de casa.",
botão "Iniciar Matrícula", ilustração moderna, animações ao rolar.

## Formulário multietapas (barra de progresso)
1. **Dados pessoais:** nome, CPF, RG, nascimento, sexo, estado civil.
2. **Contato:** telefone, WhatsApp, e-mail.
3. **Endereço:** CEP (busca automática), rua, número, bairro, cidade, estado.
4. **Curso:** curso, turno, unidade.
5. **Documentos:** upload RG frente/verso, CPF, comprovante de residência — preview + drag&drop.

## Contrato
Não é fixo — **módulo administrativo** para criar/editar/excluir/**versionar**. Cada matrícula fica
vinculada à **versão** assinada (v1.0, v1.1, ...), mantida mesmo após alterações futuras.
Editor visual tipo Google Docs (negrito, itálico, sublinhado, títulos, listas, tabelas, cláusulas),
autosave. Visualização estilo DocuSign com sidebar de status e checkbox
"Li e concordo com os termos do contrato."

## Assinatura digital (mobile)
Funciona com dedo, caneta touch e mouse. Canvas otimizado para telas pequenas + botão
**"Assinar em tela cheia"**. Opções: desenhar, digitar nome (gera assinatura) ou enviar imagem.
Botão limpar + pré-visualização.

## Finalização
Salvar no Supabase → gerar PDF → inserir assinatura + documentos → gerar nº de matrícula →
e-mail para aluno e administração → tela de sucesso (nº, curso, data) + "Baixar comprovante".

### PDF deve conter
Dados do aluno, contrato completo, assinatura, data e hora, **IP do usuário**, código único da
matrícula e **versão do contrato assinada**.

## Painel administrativo
Sidebar moderna. Menu: Dashboard, Matrículas, Alunos, Cursos, Contratos, Configurações.
- **Dashboard:** cards (total de matrículas, matrículas hoje, alunos ativos, receita prevista),
  gráficos, tabela de últimas matrículas, filtros + pesquisa instantânea.
- **Matrículas:** lista (cards responsivos) com Nome/Curso/Data/Status (Pendente/Aprovada/Rejeitada);
  painel lateral com dados completos, documentos, contrato assinado, PDF; botões Aprovar/Rejeitar/Baixar PDF.

## Autenticação & perfis
Supabase Auth. Perfis: **Administrador, Secretária, Financeiro** com permissões por função.

## Banco (Supabase)
Tabelas: users (profiles+roles), students, courses, enrollments, contracts, documents — migrations completas.

## Tecnologias
Vite + React + TypeScript + TailwindCSS + shadcn/ui + Framer Motion + Supabase + react-hook-form +
Zod + pdf-lib + Lucide. (Stack ajustada de Next.js → Vite para padronizar com o ecossistema Meta.)

## Qualidade
Estrutura profissional (components/pages/hooks/services/types/utils), código limpo, escalável,
pronto para produção, com dados de exemplo.
