import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface AdminVersion {
  id: string;
  version: string;
  content_html: string;
  is_published: boolean;
  created_at: string;
}
export interface AdminContract {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  versions: AdminVersion[];
}

const db = () => supabase as any;

export function useAdminContracts() {
  return useQuery<AdminContract[]>({
    queryKey: ["admin-contracts"],
    queryFn: async () => {
      const { data, error } = await db()
        .from("contracts")
        .select("id, title, description, active, created_at, contract_versions(id, version, content_html, is_published, created_at)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        versions: (c.contract_versions ?? []).sort((a: AdminVersion, b: AdminVersion) =>
          a.version.localeCompare(b.version, undefined, { numeric: true }),
        ),
      }));
    },
  });
}

function nextVersion(versions: AdminVersion[]): string {
  const nums = versions.map((v) => parseFloat(v.version)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return (max + 0.1).toFixed(1);
}

export async function createContract(title: string): Promise<string> {
  const { data: c, error } = await db()
    .from("contracts")
    .insert({ title, active: true })
    .select("id")
    .single();
  if (error) throw error;
  await db()
    .from("contract_versions")
    .insert({ contract_id: c.id, version: "1.0", content_html: "<h2>Novo contrato</h2><p>Comece a escrever…</p>", is_published: false });
  return c.id;
}

export async function updateContractTitle(id: string, title: string) {
  const { error } = await db().from("contracts").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function saveVersionContent(versionId: string, content_html: string) {
  const { error } = await db().from("contract_versions").update({ content_html }).eq("id", versionId);
  if (error) throw error;
}

export async function createVersion(contractId: string, versions: AdminVersion[], fromContent: string): Promise<string> {
  const { data, error } = await db()
    .from("contract_versions")
    .insert({ contract_id: contractId, version: nextVersion(versions), content_html: fromContent, is_published: false })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

// Publica uma versão e despublica as demais do mesmo contrato (1 vigente por contrato).
export async function publishVersion(contractId: string, versionId: string) {
  await db().from("contract_versions").update({ is_published: false }).eq("contract_id", contractId);
  const { error } = await db().from("contract_versions").update({ is_published: true }).eq("id", versionId);
  if (error) throw error;
}

export async function unpublishVersion(versionId: string) {
  const { error } = await db().from("contract_versions").update({ is_published: false }).eq("id", versionId);
  if (error) throw error;
}

// "Arquivar": desativa o contrato e despublica versões (preserva versões assinadas).
export async function archiveContract(contractId: string) {
  await db().from("contract_versions").update({ is_published: false }).eq("contract_id", contractId);
  const { error } = await db().from("contracts").update({ active: false }).eq("id", contractId);
  if (error) throw error;
}
