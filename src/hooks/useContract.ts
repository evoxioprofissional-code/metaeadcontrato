import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface PublishedContract {
  id: string;
  version: string;
  content_html: string;
}

// Carrega a versão publicada mais recente do contrato.
export function useContract() {
  return useQuery<PublishedContract | null>({
    queryKey: ["contract", "published"],
    queryFn: async () => {
      // cast: a tabela ainda não está no Database gerado (types.ts é placeholder).
      const { data, error } = await (supabase as any)
        .from("contract_versions")
        .select("id, version, content_html")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PublishedContract | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
