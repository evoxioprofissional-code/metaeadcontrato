import { useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Loader2, Pencil } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
import {
  COURSES,
  ESTADO_CIVIL_OPTS,
  SEXO_OPTS,
  TURNOS,
  UNITS,
} from "@/data/catalog";
import { clearAutosave, loadAutosave, useAutosave } from "@/hooks/useAutosave";
import {
  defaultEnrollment,
  enrollmentSchema,
  STEP_FIELDS,
  type EnrollmentForm,
} from "@/lib/enrollment-schema";

const STORAGE_KEY = "matricula:rascunho";
const STEP_TITLES = ["Dados pessoais", "Contato", "Endereço", "Curso", "Documentos"];
const REQUIRED_DOCS: DocType[] = ["rg_frente", "rg_verso", "cpf", "comprovante_residencia"];

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

  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<DocFiles>({});
  const [docError, setDocError] = useState<string>();
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const values = methods.watch();
  useAutosave(STORAGE_KEY, values);

  const progress = useMemo(() => ((step + 1) / STEP_TITLES.length) * 100, [step]);

  async function next() {
    const fields = STEP_FIELDS[step];
    const ok = fields.length === 0 ? true : await methods.trigger(fields);
    if (!ok) return;

    if (step < STEP_TITLES.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Última etapa: valida documentos antes de revisar.
    const missing = REQUIRED_DOCS.filter((d) => !docs[d]);
    if (missing.length > 0) {
      setDocError("Envie os 4 documentos para continuar.");
      return;
    }
    setDocError(undefined);
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    if (reviewing) {
      setReviewing(false);
      return;
    }
    if (step === 0) return;
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Fase 2 substitui isto pela navegação à assinatura do contrato.
  function goToContract() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Cadastro concluído! A assinatura do contrato será o próximo passo.");
    }, 700);
  }

  function resetDraft() {
    clearAutosave(STORAGE_KEY);
    methods.reset(defaultEnrollment);
    setDocs({});
    setStep(0);
    setReviewing(false);
    toast.message("Cadastro reiniciado.");
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

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-dvh flex-col bg-background">
        {/* Cabeçalho + barra de progresso fixa */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 && !reviewing}
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
              <span className="w-9 text-right text-xs font-medium text-muted-foreground">
                {reviewing ? "✓" : `${step + 1}/5`}
              </span>
            </div>
            <div className="mt-3">
              <Progress value={reviewing ? 100 : progress} />
              <p className="mt-2 text-sm font-medium">
                {reviewing ? "Revisão" : STEP_TITLES[step]}
              </p>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            {reviewing ? (
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

                <ReviewSection title="Dados pessoais" onEdit={() => { setReviewing(false); setStep(0); }}>
                  <Row label="Nome" value={values.fullName} />
                  <Row label="CPF" value={values.cpf} />
                  <Row label="RG" value={values.rg} />
                  <Row label="Nascimento" value={formatDate(values.birthDate)} />
                  <Row label="Sexo" value={labelOf(SEXO_OPTS, values.sexo, "value")} />
                  <Row label="Estado civil" value={labelOf(ESTADO_CIVIL_OPTS, values.estadoCivil, "value")} />
                </ReviewSection>

                <ReviewSection title="Contato" onEdit={() => { setReviewing(false); setStep(1); }}>
                  <Row label="Telefone" value={values.phone} />
                  <Row label="WhatsApp" value={values.whatsapp} />
                  <Row label="E-mail" value={values.email} />
                </ReviewSection>

                <ReviewSection title="Endereço" onEdit={() => { setReviewing(false); setStep(2); }}>
                  <Row label="Logradouro" value={`${values.street}, ${values.number}`} />
                  <Row label="Bairro" value={values.neighborhood} />
                  <Row label="Cidade/UF" value={`${values.city} - ${values.state}`} />
                  <Row label="CEP" value={values.cep} />
                </ReviewSection>

                <ReviewSection title="Curso" onEdit={() => { setReviewing(false); setStep(3); }}>
                  <Row label="Curso" value={labelOf(COURSES, values.courseSlug, "slug")} />
                  <Row label="Turno" value={labelOf(TURNOS, values.turno, "value")} />
                  <Row label="Unidade" value={labelOf(UNITS, values.unitId, "id")} />
                </ReviewSection>

                <ReviewSection title="Documentos" onEdit={() => { setReviewing(false); setStep(4); }}>
                  <Row label="Enviados" value={`${Object.keys(docs).length} de 4`} />
                </ReviewSection>

                <button
                  type="button"
                  onClick={resetDraft}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Reiniciar cadastro
                </button>
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

        {/* Barra de ação fixa (estilo app) */}
        <footer
          className="sticky bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex w-full max-w-xl gap-3 px-4 py-3">
            {(step > 0 || reviewing) && (
              <Button variant="outline" size="lg" className="flex-1" onClick={back}>
                <ArrowLeft className="size-5" />
                Voltar
              </Button>
            )}
            {reviewing ? (
              <Button
                variant="gradient"
                size="lg"
                className="flex-[2]"
                onClick={goToContract}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                Avançar para o contrato
              </Button>
            ) : (
              <Button variant="gradient" size="lg" className="flex-[2]" onClick={next}>
                {step === STEP_TITLES.length - 1 ? "Revisar matrícula" : "Continuar"}
                <ArrowRight className="size-5" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    </FormProvider>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
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

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
