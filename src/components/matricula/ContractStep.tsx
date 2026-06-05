import { CheckCircle2, Circle, FileText, Loader2 } from "lucide-react";

import { SignaturePad, type SignatureValue } from "@/components/matricula/SignaturePad";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ContractStepProps {
  loading: boolean;
  error?: boolean;
  version?: string;
  html?: string;
  docsCount: number;
  signature: SignatureValue | null;
  onSignatureChange: (v: SignatureValue | null) => void;
  accepted: boolean;
  onAcceptedChange: (v: boolean) => void;
  schoolSignatureDataUrl?: string | null;
}

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="size-5 text-success" />
      ) : (
        <Circle className="size-5 text-muted-foreground/50" />
      )}
      <span className={cn(done ? "font-medium" : "text-muted-foreground")}>{label}</span>
    </li>
  );
}

export function ContractStep({
  loading,
  error,
  version,
  html,
  docsCount,
  signature,
  onSignatureChange,
  accepted,
  onAcceptedChange,
  schoolSignatureDataUrl,
}: ContractStepProps) {
  const signed = !!signature;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contrato de matrícula</h1>
        <p className="mt-1 text-muted-foreground">Leia, assine e aceite os termos para concluir.</p>
      </div>

      {/* Status (estilo DocuSign) */}
      <ul className="meta-card grid gap-2.5 p-4 sm:grid-cols-3">
        <StatusItem done label="Dados preenchidos" />
        <StatusItem done={docsCount >= 4} label={`Documentos enviados (${docsCount}/4)`} />
        <StatusItem done={signed && accepted} label="Contrato assinado" />
      </ul>

      {/* Documento */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4 text-primary" />
            Contrato
          </span>
          {version && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              versão {version}
            </span>
          )}
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Carregando contrato…
            </div>
          )}
          {error && (
            <p className="py-10 text-center text-sm text-destructive">
              Não foi possível carregar o contrato. Verifique a conexão e tente novamente.
            </p>
          )}
          {!loading && !error && html && (
            <article
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>

      {/* Assinatura da escola (já assinada) */}
      {schoolSignatureDataUrl && (
        <div className="space-y-2">
          <h2 className="font-semibold">Assinatura da escola (CONTRATADA)</h2>
          <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-white p-2">
            <img src={schoolSignatureDataUrl} alt="Assinatura da escola" className="h-20 object-contain" />
            <span className="flex items-center gap-1 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" />
              Já assinado pela escola
            </span>
          </div>
        </div>
      )}

      {/* Assinatura do aluno */}
      <div className="space-y-3">
        <h2 className="font-semibold">Sua assinatura (CONTRATANTE)</h2>
        <SignaturePad value={signature} onChange={onSignatureChange} />
      </div>

      {/* Aceite */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-card p-4">
        <Checkbox
          checked={accepted}
          onCheckedChange={(v) => onAcceptedChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm">Li e concordo com os termos do contrato.</span>
      </label>
    </div>
  );
}
