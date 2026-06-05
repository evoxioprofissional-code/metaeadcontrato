import type { DocFiles, DocType } from "@/components/matricula/steps/Step5Documentos";
import type { SignatureValue } from "@/components/matricula/SignaturePad";
import { COURSES, UNITS } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";
import type { Financeiro } from "@/lib/contract";
import type { EnrollmentForm } from "@/lib/enrollment-schema";

function toNumber(v?: string): number | null {
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function fetchIp(): Promise<string | null> {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    return (await r.json()).ip ?? null;
  } catch {
    return null;
  }
}

export interface CreateInviteInput {
  contractVersionId: string;
  courseSlug?: string;
  unitId?: string;
  turno?: string;
  financeiro: Financeiro;
  schoolSignatureDataUrl?: string;
}

// Responsável cria um convite e recebe o link para enviar ao aluno.
export async function createInvite(input: CreateInviteInput): Promise<{ token: string; link: string }> {
  const db = supabase as any;
  const unitName = UNITS.find((u) => u.id === input.unitId)?.name;
  const [{ data: course }, { data: unit }] = await Promise.all([
    input.courseSlug
      ? db.from("courses").select("id").eq("slug", input.courseSlug).maybeSingle()
      : Promise.resolve({ data: null }),
    unitName
      ? db.from("units").select("id").ilike("name", `%${unitName}%`).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const f = input.financeiro;

  const { data, error } = await db
    .from("enrollment_invites")
    .insert({
      contract_version_id: input.contractVersionId,
      course_id: course?.id ?? null,
      unit_id: unit?.id ?? null,
      turno: input.turno || null,
      valor_matricula: toNumber(f.valorMatricula),
      num_mensalidades: f.numMensalidades ? parseInt(f.numMensalidades, 10) : null,
      valor_mensalidade: toNumber(f.valorMensalidade),
      apos_vencimento: toNumber(f.aposVencimento),
      camisa: f.camisa || null,
      pos_area: f.posArea || null,
      duracao: f.duracao || null,
      recebedor: f.recebedor || null,
      school_signature: input.schoolSignatureDataUrl || null,
    })
    .select("token")
    .single();
  if (error) throw error;

  const token = data.token as string;
  return { token, link: `${window.location.origin}/matricula?convite=${token}` };
}

function studentPayload(v: EnrollmentForm) {
  return {
    full_name: v.fullName,
    cpf: v.cpf,
    rg: v.rg,
    birth_date: v.birthDate,
    sexo: v.sexo,
    estado_civil: v.estadoCivil,
    naturalidade: v.naturalidade,
    father_name: v.fatherName,
    mother_name: v.motherName,
    phone: v.phone,
    whatsapp: v.whatsapp,
    email: v.email,
    cep: v.cep,
    street: v.street,
    number: v.number,
    complement: v.complement,
    neighborhood: v.neighborhood,
    city: v.city,
    state: v.state,
  };
}

async function uploadDocs(folder: string, docs: DocFiles) {
  const out: any[] = [];
  for (const type of Object.keys(docs) as DocType[]) {
    const file = docs[type];
    if (!file) continue;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${folder}/${type}.${ext}`;
    const up = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (!up.error) {
      out.push({ type, file_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size });
    }
  }
  return out;
}

// Aluno inicia sozinho (sem link): envia dados + documentos como SOLICITAÇÃO.
export async function submitSolicitacao(v: EnrollmentForm, docs: DocFiles): Promise<void> {
  const db = supabase as any;
  const folder = `solicitacoes/${crypto.randomUUID()}`;
  const uploadedDocs = await uploadDocs(folder, docs);

  const unitName = UNITS.find((u) => u.id === v.unitId)?.name;
  const [{ data: course }, { data: unit }] = await Promise.all([
    v.courseSlug ? db.from("courses").select("id").eq("slug", v.courseSlug).maybeSingle() : Promise.resolve({ data: null }),
    unitName ? db.from("units").select("id").ilike("name", `%${unitName}%`).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const { error } = await db.rpc("submit_solicitacao", {
    p_student: studentPayload(v),
    p_course_id: course?.id ?? null,
    p_unit_id: unit?.id ?? null,
    p_turno: v.turno || "",
    p_documents: uploadedDocs,
  });
  if (error) throw error;
}

export interface InviteData {
  token: string;
  contract_version_id: string;
  contract_html: string;
  contract_version: string;
  contract_title: string;
  course_slug: string | null;
  unit_id: string | null;
  turno: string | null;
  valor_matricula: number | null;
  num_mensalidades: number | null;
  valor_mensalidade: number | null;
  apos_vencimento: number | null;
  camisa: string | null;
  recebedor: string | null;
  duracao: string | null;
  pos_area: string | null;
  school_signature: string | null;
  student_data: Record<string, string> | null;
  documents: { type: string; file_path: string; file_name: string }[] | null;
}

export interface Solicitacao {
  id: string;
  created_at: string;
  turno: string | null;
  student_data: Record<string, string> | null;
  documents: { type: string; file_path: string; file_name: string }[] | null;
  courses: { name: string } | null;
  units: { name: string } | null;
}

// Lista as solicitações pendentes (painel da equipe).
export async function listSolicitacoes(): Promise<Solicitacao[]> {
  const { data, error } = await (supabase as any)
    .from("enrollment_invites")
    .select("id, created_at, turno, student_data, documents, courses(name), units(name)")
    .eq("status", "solicitacao")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Solicitacao[];
}

// Dono confirma a solicitação: define contrato/valores, assina e gera o link.
export async function confirmSolicitacao(
  inviteId: string,
  contractVersionId: string,
  f: Financeiro,
  schoolSignatureDataUrl: string,
): Promise<{ link: string }> {
  const { data, error } = await (supabase as any)
    .from("enrollment_invites")
    .update({
      contract_version_id: contractVersionId,
      valor_matricula: toNumber(f.valorMatricula),
      num_mensalidades: f.numMensalidades ? parseInt(f.numMensalidades, 10) : null,
      valor_mensalidade: toNumber(f.valorMensalidade),
      apos_vencimento: toNumber(f.aposVencimento),
      camisa: f.camisa || null,
      pos_area: f.posArea || null,
      duracao: f.duracao || null,
      recebedor: f.recebedor || null,
      school_signature: schoolSignatureDataUrl || null,
      status: "pendente",
    })
    .eq("id", inviteId)
    .select("token")
    .single();
  if (error) throw error;
  return { link: `${window.location.origin}/matricula?convite=${data.token}` };
}

export async function getInvite(token: string): Promise<InviteData | null> {
  const { data, error } = await (supabase as any).rpc("get_invite", { p_token: token });
  if (error) throw error;
  return (data as InviteData) ?? null;
}

// Aluno finaliza a matrícula remota: sobe arquivos ao Storage e chama a RPC.
export async function submitRemoteEnrollment(
  token: string,
  v: EnrollmentForm,
  docs: DocFiles,
  signature: SignatureValue,
): Promise<string> {
  const ip = await fetchIp();

  const uploadedDocs: any[] = [];
  for (const type of Object.keys(docs) as DocType[]) {
    const file = docs[type];
    if (!file) continue;
    const ext = file.name.split(".").pop() || "bin";
    const path = `convites/${token}/${type}.${ext}`;
    const up = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (!up.error) {
      uploadedDocs.push({
        type,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }
  }

  const sigPath = `convites/${token}/signature.png`;
  const sigUp = await supabase.storage
    .from("signatures")
    .upload(sigPath, dataUrlToBlob(signature.dataUrl), { upsert: true });

  const student = {
    full_name: v.fullName,
    cpf: v.cpf,
    rg: v.rg,
    birth_date: v.birthDate,
    sexo: v.sexo,
    estado_civil: v.estadoCivil,
    naturalidade: v.naturalidade,
    father_name: v.fatherName,
    mother_name: v.motherName,
    phone: v.phone,
    whatsapp: v.whatsapp,
    email: v.email,
    cep: v.cep,
    street: v.street,
    number: v.number,
    complement: v.complement,
    neighborhood: v.neighborhood,
    city: v.city,
    state: v.state,
  };

  const { data, error } = await (supabase as any).rpc("submit_remote_enrollment", {
    p_token: token,
    p_student: student,
    p_signature: {
      method: signature.method,
      image_path: sigUp.error ? null : sigPath,
      typed_name: signature.typedName ?? null,
    },
    p_documents: uploadedDocs,
    p_ip: ip,
    p_user_agent: navigator.userAgent,
  });
  if (error) throw error;
  return data as string;
}
