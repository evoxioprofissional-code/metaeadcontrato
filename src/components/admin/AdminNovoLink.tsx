import { useMemo, useState } from "react";
import { Check, Copy, Link2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/matricula/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSES, TURNOS, UNITS } from "@/data/catalog";
import { useContractsList } from "@/hooks/useContract";
import type { Financeiro } from "@/lib/contract";
import { createInvite } from "@/services/invites";

const CAMISAS = ["PP", "P", "M", "G", "GG"];

export function AdminNovoLink() {
  const { data: contracts = [] } = useContractsList();
  const [contractId, setContractId] = useState<string>();
  const [courseSlug, setCourseSlug] = useState<string>();
  const [unitId, setUnitId] = useState<string>();
  const [turno, setTurno] = useState<string>();
  const [f, setF] = useState<Financeiro>({});
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string>();
  const [copied, setCopied] = useState(false);

  const selected = contracts.find((c) => c.id === contractId);
  const html = selected?.content_html ?? "";
  const needAposVenc = html.includes("{{apos_vencimento}}");
  const needCamisa = html.includes("{{camisa}}");
  const needPosArea = html.includes("{{pos_area}}");
  const set = (patch: Partial<Financeiro>) => setF((prev) => ({ ...prev, ...patch }));

  const whatsappLink = useMemo(
    () =>
      link
        ? `https://wa.me/?text=${encodeURIComponent("Faça sua matrícula online: " + link)}`
        : "#",
    [link],
  );

  async function generate() {
    if (!contractId) {
      toast.error("Selecione o contrato.");
      return;
    }
    setBusy(true);
    try {
      const { link } = await createInvite({
        contractVersionId: contractId,
        courseSlug,
        unitId,
        turno,
        financeiro: f,
      });
      setLink(link);
      toast.success("Link gerado!");
    } catch (e: any) {
      toast.error("Erro ao gerar link: " + (e?.message ?? ""));
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerar link de matrícula</h1>
        <p className="mt-1 text-muted-foreground">
          Escolha o contrato e os valores; envie o link para o aluno preencher e assinar de casa.
        </p>
      </div>

      <Field label="Contrato">
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="Curso">
          <Select value={courseSlug} onValueChange={setCourseSlug}>
            <SelectTrigger>
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              {COURSES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Turno">
          <Select value={turno} onValueChange={setTurno}>
            <SelectTrigger>
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              {TURNOS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Unidade">
        <Select value={unitId} onValueChange={setUnitId}>
          <SelectTrigger>
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needPosArea && (
        <Field label="Área da pós-graduação">
          <Input
            autoCapitalize="words"
            placeholder="Ex.: Psicopedagogia"
            value={f.posArea ?? ""}
            onChange={(e) => set({ posArea: e.target.value })}
          />
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
      <Field label="Recebedor">
        <Input autoCapitalize="words" placeholder="Nome de quem recebeu" value={f.recebedor ?? ""} onChange={(e) => set({ recebedor: e.target.value })} />
      </Field>

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

      <Button variant="gradient" size="lg" className="w-full" onClick={generate} disabled={busy}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Link2 className="size-5" />}
        Gerar link
      </Button>

      {link && (
        <div className="meta-card space-y-3 p-4">
          <p className="text-sm font-medium">Link gerado — envie ao aluno:</p>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 p-2">
            <span className="min-w-0 flex-1 truncate text-sm">{link}</span>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <Button
            asChild
            className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-[#25D366]"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" />
              Enviar por WhatsApp
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
