import { Loader2, LogOut, Send, ShieldCheck } from "lucide-react";

import { StaffLogin } from "@/components/auth/StaffLogin";
import { Field } from "@/components/matricula/Field";
import { SignaturePad, type SignatureValue } from "@/components/matricula/SignaturePad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import type { PublishedContract } from "@/hooks/useContract";
import type { Financeiro } from "@/lib/contract";

interface ResponsavelStepProps {
  contracts: PublishedContract[];
  loadingContracts: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  financeiro: Financeiro;
  onChange: (f: Financeiro) => void;
  schoolSignature: SignatureValue | null;
  onSchoolSignatureChange: (v: SignatureValue | null) => void;
  onSolicitar?: () => void;
  solicitarBusy?: boolean;
}

export function ResponsavelStep({
  contracts,
  loadingContracts,
  selectedId,
  onSelect,
  financeiro,
  onChange,
  schoolSignature,
  onSchoolSignatureChange,
  onSolicitar,
  solicitarBusy,
}: ResponsavelStepProps) {
  const { isStaff, user, signOut } = useAuth();

  if (!isStaff) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quase lá!</h1>
          <p className="mt-1 text-muted-foreground">Falta só o contrato. Escolha uma opção:</p>
        </div>

        {/* Aluno: enviar solicitação */}
        {onSolicitar && (
          <div className="meta-card space-y-3 p-5">
            <h2 className="font-semibold">Sou aluno(a)</h2>
            <p className="text-sm text-muted-foreground">
              Envie sua solicitação. A escola define os valores, assina o contrato e te manda o link
              para você assinar — tudo digital.
            </p>
            <Button variant="gradient" size="lg" className="w-full" onClick={onSolicitar} disabled={solicitarBusy}>
              {solicitarBusy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              Enviar solicitação
            </Button>
          </div>
        )}

        {/* Equipe: login (matrícula presencial) */}
        <div>
          <p className="mb-2 text-center text-xs uppercase tracking-wide text-muted-foreground">
            ou, se você é da equipe
          </p>
          <StaffLogin subtitle="Entre para concluir a matrícula agora (presencial)." />
        </div>
      </div>
    );
  }

  const set = (patch: Partial<Financeiro>) => onChange({ ...financeiro, ...patch });
  const selected = contracts.find((c) => c.id === selectedId);
  const html = selected?.content_html ?? "";
  const needAposVenc = html.includes("{{apos_vencimento}}");
  const needCamisa = html.includes("{{camisa}}");
  const needPosArea = html.includes("{{pos_area}}");
  const CAMISAS = ["PP", "P", "M", "G", "GG"];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Etapa do responsável</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>

      <Field label="Contrato a aplicar">
        <Select value={selectedId} onValueChange={onSelect} disabled={loadingContracts}>
          <SelectTrigger>
            <SelectValue placeholder={loadingContracts ? "Carregando…" : "Selecione o contrato"} />
          </SelectTrigger>
          <SelectContent>
            {contracts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {(c.title ?? "Contrato") + " · versão " + c.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needPosArea && (
        <Field label="Área da pós-graduação" htmlFor="f_posarea">
          <Input
            id="f_posarea"
            autoCapitalize="words"
            placeholder="Ex.: Psicopedagogia"
            value={financeiro.posArea ?? ""}
            onChange={(e) => set({ posArea: e.target.value })}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Taxa de matrícula (R$)" htmlFor="f_matricula">
          <Input
            id="f_matricula"
            inputMode="decimal"
            placeholder="0,00"
            value={financeiro.valorMatricula ?? ""}
            onChange={(e) => set({ valorMatricula: e.target.value })}
          />
        </Field>
        <Field label="Nº de mensalidades" htmlFor="f_num">
          <Input
            id="f_num"
            inputMode="numeric"
            placeholder="12"
            value={financeiro.numMensalidades ?? ""}
            onChange={(e) => set({ numMensalidades: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Valor da mensalidade (R$)" htmlFor="f_mens">
          <Input
            id="f_mens"
            inputMode="decimal"
            placeholder="0,00"
            value={financeiro.valorMensalidade ?? ""}
            onChange={(e) => set({ valorMensalidade: e.target.value })}
          />
        </Field>
        <Field label="Duração do curso" htmlFor="f_dur">
          <Input
            id="f_dur"
            placeholder="Ex.: 12 meses"
            value={financeiro.duracao ?? ""}
            onChange={(e) => set({ duracao: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Recebedor (quem recebeu a matrícula)" htmlFor="f_receb">
        <Input
          id="f_receb"
          autoCapitalize="words"
          placeholder="Nome de quem recebeu"
          value={financeiro.recebedor ?? ""}
          onChange={(e) => set({ recebedor: e.target.value })}
        />
      </Field>

      {(needAposVenc || needCamisa) && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
          {needAposVenc && (
            <Field label="Após o vencimento (R$)" htmlFor="f_apos">
              <Input
                id="f_apos"
                inputMode="decimal"
                placeholder="0,00"
                value={financeiro.aposVencimento ?? ""}
                onChange={(e) => set({ aposVencimento: e.target.value })}
              />
            </Field>
          )}
          {needCamisa && (
            <Field label="Camisa">
              <Select value={financeiro.camisa} onValueChange={(v) => set({ camisa: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {CAMISAS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-border/60 p-3">
        <p className="text-sm font-semibold">Assinatura da escola (CONTRATADA)</p>
        <p className="text-xs text-muted-foreground">
          Assine como escola; em seguida o aluno assina a parte dele.
        </p>
        <SignaturePad value={schoolSignature} onChange={onSchoolSignatureChange} />
      </div>

      <p className="text-xs text-muted-foreground">
        Esses valores entram no contrato. A multa de cancelamento (Cláusula 7ª) usa 3× a mensalidade.
      </p>
    </div>
  );
}
