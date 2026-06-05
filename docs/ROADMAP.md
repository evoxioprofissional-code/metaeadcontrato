# Roadmap — Grupo Educacional Meta · Matrícula + Contrato

> Documento vivo. Fluxo de trabalho **por fases** com **aprovação explícita** entre cada fase.
> Princípio inegociável: **Mobile First**. Tudo nasce no celular e depois ganha o desktop.
> Meta de qualidade: Lighthouse Mobile **95+**, sem quebra de 320px → 1440px.

## Status das fases

| Fase | Descrição | Status |
|------|-----------|--------|
| **0** | Fundação (scaffold + docs + design system + schema) | ✅ Concluída |
| **1** | Landing + Formulário multietapas (mobile-first) | ✅ Concluída |
| **2** | Contrato + Assinatura digital | ✅ Concluída |
| **3** | Autenticação (staff) + Etapa do Responsável (escolha do contrato + valores) | ✅ Concluída |
| **4** | Finalização (salvar no Supabase + nº + IP + PDF) + Painel admin em `/admin` | ✅ Concluída (e-mail pendente) |
| **5** | Fluxo remoto (dono cria + link p/ aluno) | ✅ Concluída |
| **6** | Editor de contratos (multi-contrato + versionamento) | ✅ Concluída |
| **7** | Polimento & qualidade (code-splitting, testes, Storage) | ✅ Concluída · e-mail dispensado (WhatsApp + painel) |

## Detalhe das fases

### Fase 0 — Fundação ⚙️ (concluída)
- Scaffold Vite + React 18 + TS + shadcn/ui + Tailwind, espelhando o ecossistema do `meta-ead-showcase`.
- `docs/`: ROADMAP, SPEC, ARQUITETURA, DESIGN, DB-SCHEMA.
- Design system premium (cores da spec, tema claro/escuro estilo Vercel, Inter, glassmorphism, micro-animações).
- Migration inicial do schema Supabase + RLS + buckets + dados de exemplo.
- Página inicial (hero) provando o design system.

### Fase 1 — Landing + Formulário multietapas 📱
Hero completo + wizard de 5 etapas (Dados pessoais → Contato → Endereço c/ CEP automático →
Curso → Documentos com drag&drop + preview). Barra de progresso fixa, máscaras, teclado adequado
por campo, **autosave** (localStorage), validação Zod + react-hook-form, animações.

### Fase 2 — Contrato + Assinatura digital ✍️
Visualização estilo DocuSign + sidebar de status. **Versionamento**: cada matrícula amarra à versão
assinada. Assinatura por desenho (canvas), digitação ou upload, botão "Assinar em tela cheia",
checkbox de aceite obrigatório.

### Fase 3 — Autenticação + Etapa do Responsável 🔑
**Supabase Auth** (staff: Administrador / Secretária / Financeiro) + tela de login. Após o aluno
preencher, entra a **etapa do responsável** (staff logado, no mesmo aparelho): escolhe **qual
contrato** aplicar (entre os publicados) e preenche os **campos do dono** — taxa de matrícula, nº e
valor das mensalidades, valor da multa, **RECEBEDOR** e **RECEBEMOS R$**. Esses valores preenchem
os tokens `{{...}}` do contrato; em seguida o aluno assina. Campos financeiros em `enrollments`.

### Fase 4 — Finalização (salvar + PDF + e-mail) 📄
Salva tudo no Supabase (aluno, matrícula, documentos, assinatura), gera **nº de matrícula** e captura
**IP**. Edge Function gera o **PDF** (pdf-lib) com dados, contrato preenchido, assinatura, data/hora,
IP, código único e versão; anexa documentos; envia **e-mail** (aluno + administração). Tela de
sucesso + "Baixar comprovante" + **botão WhatsApp** (`https://api.whatsapp.com/send/?phone=94992582190`).

### Fase 5 — Painel administrativo + fluxo remoto 📊
Painel (dashboard, matrículas em cards + painel lateral, alunos, cursos). **Fluxo remoto**: o dono
cria a matrícula (escolhe contrato + valores) e gera um **link**; o aluno abre, completa os dados e
assina. Aprovar / Rejeitar / Baixar PDF.

### Fase 6 — Editor de contratos 📝
Editor visual tipo Google Docs (negrito, itálico, títulos, listas, tabelas, cláusulas, tokens
`{{campo}}`) com CRUD + **versionamento** + autosave. (Até lá, os contratos extras são cadastrados
a partir dos textos enviados pela escola.)

### Fase 7 — Polimento & qualidade ✨
Lighthouse 95+, responsividade testada (320/375/390/414/768/1024/1440), seed de dados, testes.
