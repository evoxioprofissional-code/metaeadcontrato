import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Download, FileText, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ESTADO_CIVIL_OPTS } from "@/data/catalog";
import {
  fetchAsDataUrl,
  getContractHtml,
  getDocuments,
  getSignature,
  setEnrollmentStatus,
  signedUrl,
  useEnrollments,
  type EnrollmentRow,
} from "@/hooks/useEnrollments";
import { mergeContract } from "@/lib/contract";
import { generateComprovante } from "@/lib/pdf";
import { cn } from "@/lib/utils";

const FILTERS = ["todas", "pendente", "aprovada", "rejeitada"] as const;
const money = (n: number | null) => (n == null ? "—" : `R$ ${n.toFixed(2).replace(".", ",")}`);

export function AdminMatriculas() {
  const { data: rows = [], isLoading } = useEnrollments();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todas");
  const [selected, setSelected] = useState<EnrollmentRow | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "todas" && r.status !== filter) return false;
      if (!term) return true;
      return (
        r.students?.full_name?.toLowerCase().includes(term) ||
        r.students?.cpf?.includes(term) ||
        r.enrollment_code?.toLowerCase().includes(term)
      );
    });
  }, [rows, q, filter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Matrículas</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, CPF ou nº"
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-muted",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="meta-card flex items-center justify-between gap-3 p-4 text-left"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{r.students?.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.courses?.name ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.enrollment_code} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </button>
          ))}
        </div>
      )}

      {selected && <DetailPanel row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailPanel({ row, onClose }: { row: EnrollmentRow; onClose: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const s = row.students;

  async function review(status: "aprovada" | "rejeitada") {
    setBusy(true);
    try {
      await setEnrollmentStatus(row.id, status);
      await qc.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success(status === "aprovada" ? "Matrícula aprovada." : "Matrícula rejeitada.");
      onClose();
    } catch (e: any) {
      toast.error("Erro ao atualizar: " + (e?.message ?? ""));
    } finally {
      setBusy(false);
    }
  }

  async function openDoc(path: string) {
    const url = await signedUrl("documents", path);
    if (url) window.open(url, "_blank");
    else toast.error("Não foi possível abrir o documento.");
  }

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const [docsList, sig, contract] = await Promise.all([
        getDocuments(row.id),
        getSignature(row.id),
        row.contract_version_id ? getContractHtml(row.contract_version_id) : Promise.resolve(null),
      ]);
      void docsList;
      let sigDataUrl = "";
      if (sig?.image_path) {
        const url = await signedUrl("signatures", sig.image_path);
        if (url) sigDataUrl = (await fetchAsDataUrl(url)) ?? "";
      }
      const estadoCivil = ESTADO_CIVIL_OPTS.find((e) => e.value === s?.estado_civil)?.label ?? "";
      const tokens: Record<string, string> = {
        curso: row.courses?.name ?? "",
        aluno_nome: s?.full_name ?? "",
        cpf: s?.cpf ?? "",
        rg: s?.rg ?? "",
        data_nascimento: s?.birth_date ?? "",
        naturalidade: s?.naturalidade ?? "",
        estado_civil: estadoCivil,
        endereco_rua: [s?.street, s?.number].filter(Boolean).join(", "),
        endereco_bairro: s?.neighborhood ?? "",
        endereco_cidade: [s?.city, s?.state].filter(Boolean).join(" - "),
        telefone: s?.phone ?? "",
        pai: s?.father_name ?? "",
        mae: s?.mother_name ?? "",
        email: s?.email ?? "",
        valor_matricula: row.valor_matricula != null ? row.valor_matricula.toFixed(2).replace(".", ",") : "",
        num_mensalidades: row.num_mensalidades?.toString() ?? "",
        valor_mensalidade: row.valor_mensalidade != null ? row.valor_mensalidade.toFixed(2).replace(".", ",") : "",
        duracao: "",
        recebedor: row.recebedor ?? "",
        data: new Date(row.created_at).toLocaleDateString("pt-BR"),
      };
      const html = contract ? mergeContract(contract.content_html, tokens) : "";
      generateComprovante({
        enrollmentCode: row.enrollment_code,
        contractHtml: html,
        signatureDataUrl: sigDataUrl,
        studentName: s?.full_name ?? "",
        courseName: row.courses?.name ?? "",
        version: contract?.version ?? "",
        ip: row.signer_ip,
        dateISO: row.created_at,
      });
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + (e?.message ?? ""));
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-meta-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background/90 px-5 py-3 backdrop-blur">
          <div>
            <p className="font-semibold">{s?.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.enrollment_code}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-5 py-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status} />
            <span className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString("pt-BR")}
            </span>
          </div>

          <Section title="Curso">
            <Info label="Curso" value={row.courses?.name} />
            <Info label="Turno" value={row.turno} />
            <Info label="Unidade" value={row.units?.name} />
          </Section>

          <Section title="Aluno">
            <Info label="CPF" value={s?.cpf} />
            <Info label="RG" value={s?.rg} />
            <Info label="Nascimento" value={s?.birth_date} />
            <Info label="Naturalidade" value={s?.naturalidade} />
            <Info label="Pai" value={s?.father_name} />
            <Info label="Mãe" value={s?.mother_name} />
            <Info label="Telefone" value={s?.phone} />
            <Info label="E-mail" value={s?.email} />
            <Info label="Endereço" value={[s?.street, s?.number, s?.neighborhood, s?.city].filter(Boolean).join(", ")} />
          </Section>

          <Section title="Financeiro">
            <Info label="Matrícula" value={money(row.valor_matricula)} />
            <Info label="Mensalidades" value={row.num_mensalidades?.toString()} />
            <Info label="Valor mensal" value={money(row.valor_mensalidade)} />
            <Info label="Recebedor" value={row.recebedor} />
          </Section>

          <Section title="Assinatura">
            <Info label="IP" value={row.signer_ip} />
          </Section>

          <DocumentsBlock enrollmentId={row.id} onOpen={openDoc} />

          <Button variant="outline" className="w-full" onClick={downloadPdf} disabled={pdfBusy}>
            {pdfBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Baixar PDF do contrato
          </Button>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-border/60 bg-background/90 px-5 py-3 backdrop-blur">
          <Button
            variant="outline"
            className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => review("rejeitada")}
            disabled={busy || row.status === "rejeitada"}
          >
            <X className="size-4" />
            Rejeitar
          </Button>
          <Button
            className="flex-1 bg-success text-success-foreground hover:bg-success/90"
            onClick={() => review("aprovada")}
            disabled={busy || row.status === "aprovada"}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Aprovar
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentsBlock({ enrollmentId, onOpen }: { enrollmentId: string; onOpen: (p: string) => void }) {
  const [docs, setDocs] = useState<{ type: string; file_path: string; file_name: string }[]>();
  if (docs === undefined) {
    getDocuments(enrollmentId).then(setDocs);
  }
  return (
    <Section title="Documentos">
      {(docs ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem documentos.</p>
      ) : (
        <div className="space-y-1.5">
          {(docs ?? []).map((d) => (
            <button
              key={d.type}
              onClick={() => onOpen(d.file_path)}
              className="flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <FileText className="size-4 text-primary" />
              <span className="capitalize">{d.type.replace(/_/g, " ")}</span>
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}
