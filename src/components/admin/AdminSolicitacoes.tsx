import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, FileText, Inbox, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

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
import { useContractsList } from "@/hooks/useContract";
import { signedUrl } from "@/hooks/useEnrollments";
import type { Financeiro } from "@/lib/contract";
import { confirmSolicitacao, listSolicitacoes, type Solicitacao } from "@/services/invites";

const CAMISAS = ["PP", "P", "M", "G", "GG"];

export function AdminSolicitacoes() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["solicitacoes"], queryFn: listSolicitacoes });
  const [open, setOpen] = useState<Solicitacao | null>(null);

  if (open) return <Detalhe s={open} onBack={() => setOpen(null)} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Solicitações</h1>
      <p className="text-muted-foreground">Pré-matrículas enviadas por alunos, aguardando o contrato.</p>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : list.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Inbox className="mx-auto mb-2 size-8 opacity-50" />
          <p className="text-sm">Nenhuma solicitação pendente.</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {list.map((s) => (
            <button key={s.id} onClick={() => setOpen(s)} className="meta-card p-4 text-left">
              <p className="truncate font-medium">{s.student_data?.full_name ?? "—"}</p>
              <p className="truncate text-xs text-muted-foreground">{s.courses?.name ?? "Curso não informado"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(s.created_at).toLocaleString("pt-BR")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Detalhe({ s, onBack }: { s: Solicitacao; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: contracts = [] } = useContractsList();
  const [contractId, setContractId] = useState<string>();
  const [f, setF] = useState<Financeiro>({});
  const [schoolSig, setSchoolSig] = useState<SignatureValue | null>(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string>();
  const [copied, setCopied] = useState(false);

  const sd = s.student_data ?? {};
  const selected = contracts.find((c) => c.id === contractId);
  const html = selected?.content_html ?? "";
  const needAposVenc = html.includes("{{apos_vencimento}}");
  const needCamisa = html.includes("{{camisa}}");
  const needPosArea = html.includes("{{pos_area}}");
  const set = (patch: Partial<Financeiro>) => setF((prev) => ({ ...prev, ...patch }));

  async function openDoc(path: string) {
    const url = await signedUrl("documents", path);
    if (url) window.open(url, "_blank");
    else toast.error("Não foi possível abrir o documento.");
  }

  async function confirmar() {
    if (!contractId) return toast.error("Selecione o contrato.");
    if (!schoolSig) return toast.error("Assine como escola (CONTRATADA).");
    setBusy(true);
    try {
      const { link } = await confirmSolicitacao(s.id, contractId, f, schoolSig.dataUrl);
      setLink(link);
      qc.invalidateQueries({ queryKey: ["solicitacoes"] });
      toast.success("Link gerado! Envie ao aluno.");
    } catch (e: any) {
      toast.error("Erro: " + (e?.message ?? ""));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (link) {
    const wa = `https://wa.me/?text=${encodeURIComponent("Finalize sua matrícula: " + link)}`;
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="size-4" /> Solicitações
        </button>
        <div className="meta-card space-y-3 border-2 border-success/50 p-4">
          <p className="text-sm font-semibold text-success">✓ Link gerado — envie ao aluno assinar:</p>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 p-2">
            <span className="min-w-0 flex-1 truncate text-sm">{link}</span>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5d]">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" /> Enviar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" /> Solicitações
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{sd.full_name ?? "Solicitação"}</h1>
        <p className="text-sm text-muted-foreground">{s.courses?.name ?? "Curso não informado"}</p>
      </div>

      {/* Dados do aluno */}
      <div className="meta-card space-y-1 p-4 text-sm">
        <Row k="CPF" v={sd.cpf} /> <Row k="RG" v={sd.rg} /> <Row k="Nascimento" v={sd.birth_date} />
        <Row k="Telefone" v={sd.phone} /> <Row k="E-mail" v={sd.email} />
        <Row k="Endereço" v={[sd.street, sd.number, sd.neighborhood, sd.city].filter(Boolean).join(", ")} />
        <Row k="Pai" v={sd.father_name} /> <Row k="Mãe" v={sd.mother_name} />
      </div>

      {/* Documentos */}
      {s.documents && s.documents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Documentos enviados</p>
          {s.documents.map((d) => (
            <button
              key={d.type}
              onClick={() => openDoc(d.file_path)}
              className="flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <FileText className="size-4 text-primary" />
              <span className="capitalize">{d.type.replace(/_/g, " ")}</span>
            </button>
          ))}
        </div>
      )}

      {/* Definir contrato + valores */}
      <Field label="Contrato a aplicar">
        <Select value={contractId} onValueChange={setContractId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o contrato" />
          </SelectTrigger>
          <SelectContent>
            {contracts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {(c.title ?? "Contrato") + " · v" + c.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needPosArea && (
        <Field label="Área da pós-graduação">
          <Input placeholder="Ex.: Psicopedagogia" value={f.posArea ?? ""} onChange={(e) => set({ posArea: e.target.value })} />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Taxa de matrícula (R$)">
          <Input inputMode="decimal" placeholder="0,00" value={f.valorMatricula ?? ""} onChange={(e) => set({ valorMatricula: e.target.value })} />
        </Field>
        <Field label="Nº de mensalidades">
          <Input inputMode="numeric" placeholder="12" value={f.numMensalidades ?? ""} onChange={(e) => set({ numMensalidades: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Valor da mensalidade (R$)">
          <Input inputMode="decimal" placeholder="0,00" value={f.valorMensalidade ?? ""} onChange={(e) => set({ valorMensalidade: e.target.value })} />
        </Field>
        <Field label="Duração">
          <Input placeholder="Ex.: 12 meses" value={f.duracao ?? ""} onChange={(e) => set({ duracao: e.target.value })} />
        </Field>
      </div>
      {(needAposVenc || needCamisa) && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
          {needAposVenc && (
            <Field label="Após o vencimento (R$)">
              <Input inputMode="decimal" placeholder="0,00" value={f.aposVencimento ?? ""} onChange={(e) => set({ aposVencimento: e.target.value })} />
            </Field>
          )}
          {needCamisa && (
            <Field label="Camisa">
              <Select value={f.camisa} onValueChange={(v) => set({ camisa: v })}>
                <SelectTrigger><SelectValue placeholder="Tamanho" /></SelectTrigger>
                <SelectContent>
                  {CAMISAS.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      )}
      <Field label="Recebedor">
        <Input placeholder="Nome de quem recebeu" value={f.recebedor ?? ""} onChange={(e) => set({ recebedor: e.target.value })} />
      </Field>

      <div className="space-y-2 rounded-xl border border-border/60 p-3">
        <p className="text-sm font-semibold">Assinatura da escola (CONTRATADA)</p>
        <SignaturePad value={schoolSig} onChange={setSchoolSig} />
      </div>

      <Button variant="gradient" size="lg" className="w-full" onClick={confirmar} disabled={busy}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
        Confirmar e gerar link para o aluno
      </Button>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v || "—"}</span>
    </div>
  );
}
