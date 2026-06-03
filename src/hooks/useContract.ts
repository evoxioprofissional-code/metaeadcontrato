import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface PublishedContract {
  id: string;
  version: string;
  content_html: string;
  title?: string;
}

// Lista todas as versões publicadas (para o responsável escolher qual aplicar).
export function useContractsList() {
  return useQuery<PublishedContract[]>({
    queryKey: ["contracts", "published-list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contract_versions")
        .select("id, version, content_html, contracts(title)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        version: r.version,
        content_html: r.content_html,
        title: r.contracts?.title,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
