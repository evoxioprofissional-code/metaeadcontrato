import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface EnrollmentRow {
  id: string;
  enrollment_code: string;
  status: "pendente" | "aprovada" | "rejeitada";
  created_at: string;
  signer_ip: string | null;
  turno: string | null;
  valor_matricula: number | null;
  num_mensalidades: number | null;
  valor_mensalidade: number | null;
  recebedor: string | null;
  apos_vencimento: number | null;
  camisa: string | null;
  pos_area: string | null;
  school_signature: string | null;
  contract_version_id: string | null;
  students: {
    full_name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    birth_date: string | null;
    naturalidade: string | null;
    father_name: string | null;
    mother_name: string | null;
    rg: string | null;
    estado_civil: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    cep: string | null;
  } | null;
  courses: { name: string } | null;
  units: { name: string } | null;
}

const SELECT =
  "id, enrollment_code, status, created_at, signer_ip, turno, valor_matricula, num_mensalidades, valor_mensalidade, recebedor, apos_vencimento, camisa, pos_area, school_signature, contract_version_id, " +
  "students(full_name, cpf, email, phone, whatsapp, birth_date, naturalidade, father_name, mother_name, rg, estado_civil, street, number, neighborhood, city, state, cep), " +
  "courses(name), units(name)";

export function useEnrollments() {
  return useQuery<EnrollmentRow[]>({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("enrollments")
        .select(SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EnrollmentRow[];
    },
  });
}

export async function setEnrollmentStatus(id: string, status: "aprovada" | "rejeitada") {
  const { error } = await (supabase as any)
    .from("enrollments")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// URL assinada temporária para um arquivo em bucket privado.
export async function signedUrl(bucket: string, path: string): Promise<string | null> {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

export async function getDocuments(enrollmentId: string) {
  const { data } = await (supabase as any)
    .from("documents")
    .select("type, file_path, file_name")
    .eq("enrollment_id", enrollmentId);
  return (data ?? []) as { type: string; file_path: string; file_name: string }[];
}

export async function getSignature(enrollmentId: string) {
  const { data } = await (supabase as any)
    .from("signatures")
    .select("image_path, method, typed_name")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  return data as { image_path: string | null; method: string; typed_name: string | null } | null;
}

export async function getContractHtml(versionId: string): Promise<{ version: string; content_html: string } | null> {
  const { data } = await (supabase as any)
    .from("contract_versions")
    .select("version, content_html")
    .eq("id", versionId)
    .maybeSingle();
  return data ?? null;
}

export async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(String(r.result));
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
