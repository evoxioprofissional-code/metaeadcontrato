import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, FilePlus2, Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { ContractEditor } from "@/components/admin/ContractEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  archiveContract,
  createContract,
  createVersion,
  publishVersion,
  saveVersionContent,
  unpublishVersion,
  updateContractTitle,
  useAdminContracts,
  type AdminContract,
  type AdminVersion,
} from "@/services/contractsAdmin";

export function AdminContratos() {
  const { data: contracts = [], isLoading } = useAdminContracts();
  const qc = useQueryClient();
  const refetch = () => qc.invalidateQueries({ queryKey: ["admin-contracts"] });

  const [openId, setOpenId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const open = contracts.find((c) => c.id === openId);

  async function doCreate() {
    if (newTitle.trim().length < 3) return toast.error("Dê um título ao contrato.");
    try {
      const id = await createContract(newTitle.trim());
      setNewTitle("");
      setCreating(false);
      await refetch();
      setOpenId(id);
    } catch (e: any) {
      toast.error("Erro: " + (e?.message ?? ""));
    }
  }

  if (open) {
    return <ContractDetail contract={open} onBack={() => setOpenId(undefined)} onChanged={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
        <Button size="sm" variant="gradient" onClick={() => setCreating((v) => !v)}>
          <Plus className="size-4" />
          Novo
        </Button>
      </div>

      {creating && (
        <div className="meta-card flex gap-2 p-3">
          <Input
            autoFocus
            placeholder="Título do contrato"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doCreate()}
          />
          <Button onClick={doCreate}>Criar</Button>
        </div>
      )}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-2.5">
          {contracts.map((c) => {
            const published = c.versions.find((v) => v.is_published);
            return (
              <button
                key={c.id}
                onClick={() => setOpenId(c.id)}
                className={cn("meta-card flex items-center justify-between gap-3 p-4 text-left", !c.active && "opacity-60")}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.versions.length} versão(ões){" "}
                    {published ? `· publicada v${published.version}` : "· nenhuma publicada"}
                    {!c.active && " · arquivado"}
                  </p>
                </div>
                {published && <Check className="size-5 shrink-0 text-success" />}
              </button>
            );
          })}
          {contracts.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum contrato. Crie o primeiro.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ContractDetail({
  contract,
  onBack,
  onChanged,
}: {
  contract: AdminContract;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(contract.title);
  const [versionId, setVersionId] = useState(
    contract.versions.find((v) => v.is_published)?.id ?? contract.versions[contract.versions.length - 1]?.id,
  );
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const version = contract.versions.find((v) => v.id === versionId);

  function onEditorChange(html: string) {
    if (!version) return;
    setSaving("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveVersionContent(version.id, html);
        setSaving("saved");
        setTimeout(() => setSaving("idle"), 1500);
      } catch {
        setSaving("idle");
      }
    }, 800);
  }

  async function saveTitle() {
    if (title.trim() && title !== contract.title) {
      await updateContractTitle(contract.id, title.trim());
      onChanged();
      toast.success("Título salvo.");
    }
  }

  async function doNewVersion() {
    if (!version) return;
    const id = await createVersion(contract.id, contract.versions, version.content_html);
    onChanged();
    setVersionId(id);
    toast.success("Nova versão criada (rascunho).");
  }

  async function doPublish() {
    if (!version) return;
    await publishVersion(contract.id, version.id);
    onChanged();
    toast.success(`Versão ${version.version} publicada.`);
  }

  async function doUnpublish() {
    if (!version) return;
    await unpublishVersion(version.id);
    onChanged();
    toast.message("Versão despublicada.");
  }

  async function doArchive() {
    await archiveContract(contract.id);
    onChanged();
    toast.message("Contrato arquivado.");
    onBack();
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Contratos
      </button>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} className="text-lg font-semibold" />

      {/* Versões */}
      <div className="flex flex-wrap items-center gap-2">
        {contract.versions.map((v) => (
          <button
            key={v.id}
            onClick={() => setVersionId(v.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              v.id === versionId ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-muted",
            )}
          >
            v{v.version}
            {v.is_published && " ✓"}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {saving === "saving" ? "Salvando…" : saving === "saved" ? "Salvo" : ""}
        </span>
      </div>

      {version && (version.is_published ? (
        <PublishedView version={version} onNewVersion={doNewVersion} onUnpublish={doUnpublish} />
      ) : (
        <>
          <ContractEditor key={version.id} initialHtml={version.content_html} onChange={onEditorChange} />
          <div className="flex flex-wrap gap-2">
            <Button variant="gradient" onClick={doPublish}>
              <Check className="size-4" />
              Publicar v{version.version}
            </Button>
            <Button variant="outline" onClick={doNewVersion}>
              <FilePlus2 className="size-4" />
              Nova versão
            </Button>
            <Button variant="outline" className="text-destructive" onClick={doArchive}>
              Arquivar contrato
            </Button>
          </div>
        </>
      ))}
    </div>
  );
}

function PublishedView({
  version,
  onNewVersion,
  onUnpublish,
}: {
  version: AdminVersion;
  onNewVersion: () => void;
  onUnpublish: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/5 px-4 py-2.5 text-sm">
        <Check className="size-4 text-success" />
        Versão publicada (vigente). Para editar, crie uma nova versão — assim as matrículas já
        assinadas mantêm o texto original.
      </div>
      <div
        className="prose prose-sm max-w-none rounded-2xl border border-border/60 bg-card p-5 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: version.content_html }}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="gradient" onClick={onNewVersion}>
          <FilePlus2 className="size-4" />
          Nova versão para editar
        </Button>
        <Button variant="outline" onClick={onUnpublish}>
          Despublicar
        </Button>
      </div>
    </div>
  );
}
