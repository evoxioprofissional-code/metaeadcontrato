import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  GraduationCap,
  Loader2,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ContractStep } from "@/components/matricula/ContractStep";
import { ResponsavelStep } from "@/components/matricula/ResponsavelStep";
import type { SignatureValue } from "@/components/matricula/SignaturePad";
import { Step1Dados } from "@/components/matricula/steps/Step1Dados";
import { Step2Contato } from "@/components/matricula/steps/Step2Contato";
import { Step3Endereco } from "@/components/matricula/steps/Step3Endereco";
import { Step4Curso } from "@/components/matricula/steps/Step4Curso";
import {
  Step5Documentos,
  type DocFiles,
  type DocType,
} from "@/components/matricula/steps/Step5Documentos";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { COURSES, ESTADO_CIVIL_OPTS, SEXO_OPTS, TURNOS, UNITS } from "@/data/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useContractsList } from "@/hooks/useContract";
import { clearAutosave, loadAutosave, useAutosave } from "@/hooks/useAutosave";
import { buildContractData, mergeContract, type Financeiro } from "@/lib/contract";
import { generateComprovante } from "@/lib/pdf";
import { submitEnrollment, type SubmitResult } from "@/services/enrollment";
import { getInvite, submitRemoteEnrollment, submitSolicitacao, type InviteData } from "@/services/invites";
import {
  defaultEnrollment,
  enrollmentSchema,
  STEP_FIELDS,
  type EnrollmentForm,
} from "@/lib/enrollment-schema";

const STORAGE_KEY = "matricula:rascunho";
const STEP_TITLES = ["Dados pessoais", "Contato", "Endereço", "Curso", "Documentos"];
const REQUIRED_DOCS: DocType[] = ["rg_frente", "rg_verso", "comprovante_residencia"];
const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=94992582190&text&type=phone_number&app_absent=0";

type Phase = "form" | "review" | "responsavel" | "contract" | "success";

function labelOf<T extends { value?: string; slug?: string; id?: string; name?: string; label?: string }>(
  list: readonly T[],
  key: string,
  field: "value" | "slug" | "id",
) {
  const found = list.find((x) => (x as Record<string, unknown>)[field] === key);
  return found ? (found.label ?? found.name ?? "") : "";
}

export default function Matricula() {
  const methods = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    mode: "onTouched",
    defaultValues: { ...defaultEnrollment, ...(loadAutosave<EnrollmentForm>(STORAGE_KEY) ?? {}) },
  });

  const { isStaff, user } = useAuth();
  const [phase, setPhase] = useState<Phase>("form");
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<DocFiles>({});
  const [docError, setDocError] = useState<string>();
  const [signature, setSignature] = useState<SignatureValue | null>(null);
  const [schoolSignature, setSchoolSignature] = useState<SignatureValue | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>();
  const [financeiro, setFinanceiro] = useState<Financeiro>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const [searchParams] = useSearchParams();
  const conviteToken = searchParams.get("convite") ?? undefined;
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!conviteToken);
  const [inviteError, setInviteError] = useState(false);
  const [docsFromInvite, setDocsFromInvite] = useState(false);
  const [solicitarBusy, setSolicitarBusy] = useState(false);
  const [solicitacaoSent, setSolicitacaoSent] = useState(false);
  const remote = !!invite;

  const values = methods.watch();
  useAutosave(STORAGE_KEY, values);

  // Fluxo remoto: carrega o convite e pré-preenche curso/turno/unidade.
  useEffect(() => {
    if (!conviteToken) return;
    let active = true;
    getInvite(conviteToken)
      .then((inv) => {
        if (!active) return;
        if (!inv) return setInviteError(true);
        setInvite(inv);
        if (inv.course_slug) methods.setValue("courseSlug", inv.course_slug);
        if (inv.turno) methods.setValue("turno", inv.turno);
        if (inv.unit_id) methods.setValue("unitId", inv.unit_id);
        // Pré-preenche dados do aluno vindos de uma solicitação.
        const sd = inv.student_data;
        if (sd) {
          const map: Record<string, keyof EnrollmentForm> = {
            full_name: "fullName", cpf: "cpf", rg: "rg", birth_date: "birthDate",
            sexo: "sexo", estado_civil: "estadoCivil", naturalidade: "naturalidade",
            father_name: "fatherName", mother_name: "motherName", phone: "phone",
            whatsapp: "whatsapp", email: "email", cep: "cep", street: "street",
            number: "number", complement: "complement", neighborhood: "neighborhood",
            city: "city", state: "state",
          };
          Object.entries(map).forEach(([k, field]) => {
            if (sd[k]) methods.setValue(field, sd[k]);
          });
        }
        if (inv.documents && inv.documents.length > 0) setDocsFromInvite(true);
      })
      .catch(() => active && setInviteError(true))
      .finally(() => active && setInviteLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conviteToken]);

  const contractsQuery = useContractsList();
  const contracts = contractsQuery.data ?? [];
  const selectedContract =
    contracts.find((c) => c.id === selectedContractId) ?? (contracts.length === 1 ? contracts[0] : undefined);

  const inviteFinanceiro: Financeiro = invite
    ? {
        valorMatricula: fmtMoney(invite.valor_matricula),
        numMensalidades: invite.num_mensalidades?.toString() ?? "",
        valorMensalidade: fmtMoney(invite.valor_mensalidade),
        duracao: invite.duracao ?? "",
        recebedor: invite.recebedor ?? "",
        aposVencimento: fmtMoney(invite.apos_vencimento),
        camisa: invite.camisa ?? "",
        posArea: invite.pos_area ?? "",
      }
    : financeiro;

  const effContractHtml = remote ? invite!.contract_html : selectedContract?.content_html;
  const effContractVersion = remote ? invite!.contract_version : selectedContract?.version;
  const effFinanceiro = remote ? inviteFinanceiro : financeiro;
  const effSchoolSig = remote ? invite!.school_signature ?? undefined : schoolSignature?.dataUrl;

  const mergedHtml = useMemo(
    () =>
      effContractHtml ? mergeContract(effContractHtml, buildContractData(values, effFinanceiro)) : undefined,
    [effContractHtml, values, effFinanceiro],
  );

  const docsCount = Object.keys(docs).length;
  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  async function next() {
    const fields = STEP_FIELDS[step];
    const ok = fields.length === 0 ? true : await methods.trigger(fields);
    if (!ok) return;

    if (step < STEP_TITLES.length - 1) {
      setStep((s) => s + 1);
      scrollTop();
      return;
    }
    if (!docsFromInvite) {
      const missing = REQUIRED_DOCS.filter((d) => !docs[d]);
      if (missing.length > 0) {
        setDocError("Envie os 3 documentos para continuar.");
        return;
      }
    }
    setDocError(undefined);
    setPhase("review");
    scrollTop();
  }

  function back() {
    if (phase === "contract") return setPhase(remote ? "review" : "responsavel"), scrollTop();
    if (phase === "responsavel") return setPhase("review"), scrollTop();
    if (phase === "review") return setPhase("form"), scrollTop();
    if (step === 0) return;
    setStep((s) => s - 1);
    scrollTop();
  }

  function editAt(target: number) {
    setPhase("form");
    setStep(target);
  }

  async function finalize() {
    if (!signature) {
      toast.error("Faça sua assinatura para concluir.");
      return;
    }
    if (!accepted) {
      toast.error("Marque que você leu e concorda com o contrato.");
      return;
    }
    if (!remote && !selectedContract) {
      toast.error("Selecione o contrato na etapa do responsável.");
      return;
    }
    setSubmitting(true);
    try {
      let res: SubmitResult;
      if (remote) {
        const code = await submitRemoteEnrollment(invite!.token, values, docs, signature);
        res = { enrollmentId: "", enrollmentCode: code, ip: null };
      } else {
        res = await submitEnrollment({
          values,
          docs,
          signature,
          financeiro,
          contractVersionId: selectedContract!.id,
          responsavelId: user?.id,
          schoolSignatureDataUrl: schoolSignature?.dataUrl,
        });
      }
      setResult(res);
      clearAutosave(STORAGE_KEY);
      setPhase("success");
      scrollTop();
    } catch (e: any) {
      toast.error("Não foi possível salvar a matrícula. " + (e?.message ?? "Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    <Step1Dados key="s1" />,
    <Step2Contato key="s2" />,
    <Step3Endereco key="s3" />,
    <Step4Curso key="s4" />,
    <Step5Documentos
      key="s5"
      files={docs}
      error={docError}
      alreadySent={docsFromInvite}
      onChange={(type, file) =>
        setDocs((prev) => {
          const copy = { ...prev };
          if (file) copy[type] = file;
          else delete copy[type];
          return copy;
        })
      }
    />,
  ];

  async function solicitar() {
    setSolicitarBusy(true);
    try {
      await submitSolicitacao(values, docs);
      clearAutosave(STORAGE_KEY);
      setSolicitacaoSent(true);
      scrollTop();
    } catch (e: any) {
      toast.error("Não foi possível enviar a solicitação. " + (e?.message ?? "Tente novamente."));
    } finally {
      setSolicitarBusy(false);
    }
  }

  async function downloadComprovante() {
    if (!result || !signature || !mergedHtml) return;
    await generateComprovante({
      enrollmentCode: result.enrollmentCode,
      contractHtml: mergedHtml,
      signatureDataUrl: signature.dataUrl,
      studentName: values.fullName,
      courseName: labelOf(COURSES, values.courseSlug, "slug"),
      version: effContractVersion ?? "",
      ip: result.ip,
      schoolSignatureDataUrl: effSchoolSig,
    });
  }

  // ----- Solicitação enviada (aluno iniciou sem link) -----
  if (solicitacaoSent) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="mb-6 flex size-20 items-center justify-center rounded-full bg-success/10 text-success"
        >
          <CheckCircle2 className="size-12" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">
          Solicitação enviada, {values.fullName?.split(" ")[0] || "tudo certo"}!
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Recebemos seus dados. A secretaria do Grupo Educacional Meta vai finalizar seu contrato e
          te enviar o link para você <strong>assinar</strong>. Fique de olho no seu WhatsApp/e-mail.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366]"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" />
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ----- Convite remoto: carregando / inválido -----
  if (conviteToken && inviteLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (conviteToken && inviteError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-xl font-bold">Link inválido ou já utilizado</h1>
        <p className="max-w-sm text-muted-foreground">
          Peça um novo link de matrícula à secretaria do Grupo Educacional Meta.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Ir para o início</Link>
        </Button>
      </div>
    );
  }

  // ----- Tela de sucesso (fim do fluxo) -----
  if (phase === "success") {
    const curso = labelOf(COURSES, values.courseSlug, "slug");
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="mb-6 flex size-20 items-center justify-center rounded-full bg-success/10 text-success"
        >
          <CheckCircle2 className="size-12" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">
          Contrato assinado, {values.fullName?.split(" ")[0] || "tudo certo"}!
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Você concluiu sua matrícula no curso <strong>{curso}</strong>.
        </p>

        {result && (
          <div className="mt-5 rounded-2xl border border-border/60 bg-card px-8 py-4">
            <p className="text-xs text-muted-foreground">Número da matrícula</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{result.enrollmentCode}</p>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Button variant="gradient" size="xl" onClick={downloadComprovante}>
            <Download className="size-5" />
            Baixar comprovante
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366]"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" />
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const counter = phase === "form" ? `${step + 1}/5` : "✓";
  const title =
    phase === "form"
      ? STEP_TITLES[step]
      : phase === "review"
        ? "Revisão"
        : phase === "responsavel"
          ? "Responsável"
          : "Contrato";

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-dvh flex-col bg-background">
        {/* Cabeçalho + progresso */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={phase === "form" && step === 0}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-0"
                aria-label="Voltar"
              >
                <ArrowLeft className="size-5" />
              </button>
              <Link to="/" className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </span>
                <span className="text-sm font-semibold">Matrícula</span>
              </Link>
              <span className="w-9 text-right text-xs font-medium text-muted-foreground">{counter}</span>
            </div>
            <div className="mt-3">
              <Progress value={phase === "form" ? progress : 100} />
              <p className="mt-2 text-sm font-medium">{title}</p>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            {phase === "review" ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Tudo certo, {values.fullName?.split(" ")[0] || "aluno(a)"}!
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Confira seus dados antes de seguir para o contrato.
                  </p>
                </div>

                <ReviewSection title="Dados pessoais" onEdit={() => editAt(0)}>
                  <Row label="Nome" value={values.fullName} />
                  <Row label="CPF" value={values.cpf} />
                  <Row label="RG" value={values.rg} />
                  <Row label="Nascimento" value={formatDate(values.birthDate)} />
                  <Row label="Sexo" value={labelOf(SEXO_OPTS, values.sexo, "value")} />
                  <Row label="Estado civil" value={labelOf(ESTADO_CIVIL_OPTS, values.estadoCivil, "value")} />
                  <Row label="Naturalidade" value={values.naturalidade} />
                  <Row label="Pai" value={values.fatherName} />
                  <Row label="Mãe" value={values.motherName} />
                </ReviewSection>

                <ReviewSection title="Contato" onEdit={() => editAt(1)}>
                  <Row label="Telefone" value={values.phone} />
                  <Row label="WhatsApp" value={values.whatsapp} />
                  <Row label="E-mail" value={values.email} />
                </ReviewSection>

                <ReviewSection title="Endereço" onEdit={() => editAt(2)}>
                  <Row label="Logradouro" value={`${values.street}, ${values.number}`} />
                  <Row label="Bairro" value={values.neighborhood} />
                  <Row label="Cidade/UF" value={`${values.city} - ${values.state}`} />
                  <Row label="CEP" value={values.cep} />
                </ReviewSection>

                <ReviewSection title="Curso" onEdit={() => editAt(3)}>
                  <Row label="Curso" value={labelOf(COURSES, values.courseSlug, "slug")} />
                  <Row label="Turno" value={labelOf(TURNOS, values.turno, "value")} />
                  <Row label="Unidade" value={labelOf(UNITS, values.unitId, "id")} />
                </ReviewSection>

                <ReviewSection title="Documentos" onEdit={() => editAt(4)}>
                  <Row label="Enviados" value={`${docsCount} de 3`} />
                </ReviewSection>
              </motion.div>
            ) : phase === "responsavel" ? (
              <motion.div
                key="responsavel"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ResponsavelStep
                  contracts={contracts}
                  loadingContracts={contractsQuery.isLoading}
                  selectedId={selectedContract?.id}
                  onSelect={setSelectedContractId}
                  financeiro={financeiro}
                  onChange={setFinanceiro}
                  schoolSignature={schoolSignature}
                  onSchoolSignatureChange={setSchoolSignature}
                  onSolicitar={solicitar}
                  solicitarBusy={solicitarBusy}
                />
              </motion.div>
            ) : phase === "contract" ? (
              <motion.div
                key="contract"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ContractStep
                  loading={remote ? false : contractsQuery.isLoading}
                  error={remote ? false : contractsQuery.isError}
                  version={effContractVersion}
                  html={mergedHtml}
                  docsCount={docsCount}
                  signature={signature}
                  onSignatureChange={setSignature}
                  accepted={accepted}
                  onAcceptedChange={setAccepted}
                  schoolSignatureDataUrl={effSchoolSig}
                />
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                {steps[step]}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Barra de ação fixa */}
        <footer
          className="sticky bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex w-full max-w-xl gap-3 px-4 py-3">
            {(phase !== "form" || step > 0) && (
              <Button variant="outline" size="lg" className="flex-1" onClick={back}>
                <ArrowLeft className="size-5" />
                Voltar
              </Button>
            )}
            {phase === "form" && (
              <Button variant="gradient" size="lg" className="flex-[2]" onClick={next}>
                {step === STEP_TITLES.length - 1 ? "Revisar matrícula" : "Continuar"}
                <ArrowRight className="size-5" />
              </Button>
            )}
            {phase === "review" && (
              <Button variant="gradient" size="lg" className="flex-[2]" onClick={() => { setPhase(remote ? "contract" : "responsavel"); scrollTop(); }}>
                Avançar
                <ArrowRight className="size-5" />
              </Button>
            )}
            {phase === "responsavel" && (
              <Button
                variant="gradient"
                size="lg"
                className="flex-[2]"
                disabled={!isStaff || !selectedContract || !schoolSignature}
                onClick={() => { setPhase("contract"); scrollTop(); }}
              >
                Ir para a assinatura
                <ArrowRight className="size-5" />
              </Button>
            )}
            {phase === "contract" && (
              <Button
                variant="gradient"
                size="lg"
                className="flex-[2]"
                onClick={finalize}
                disabled={!signature || !accepted || submitting}
              >
                {submitting ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                {submitting ? "Salvando…" : "Finalizar matrícula"}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </FormProvider>
  );
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="meta-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary"
        >
          <Pencil className="size-3.5" />
          Editar
        </button>
      </div>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function fmtMoney(n?: number | null) {
  return n == null ? "" : n.toFixed(2).replace(".", ",");
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
