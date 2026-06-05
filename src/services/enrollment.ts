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
    const res = await fetch("https://api.ipify.org?format=json");
    const j = await res.json();
    return j.ip ?? null;
  } catch {
    return null;
  }
}

export interface SubmitInput {
  values: EnrollmentForm;
  docs: DocFiles;
  signature: SignatureValue;
  financeiro: Financeiro;
  contractVersionId: string;
  responsavelId?: string;
}

export interface SubmitResult {
  enrollmentId: string;
  enrollmentCode: string;
  ip: string | null;
}

// Salva a matrícula completa no Supabase (usa a sessão autenticada do responsável).
export async function submitEnrollment(input: SubmitInput): Promise<SubmitResult> {
  const { values: v, docs, signature, financeiro: f, contractVersionId, responsavelId } = input;
  const db = supabase as any;
  const ip = await fetchIp();

  // 1) Resolve IDs de curso/unidade no banco a partir do catálogo.
  const courseName = COURSES.find((c) => c.slug === v.courseSlug)?.name;
  const unitName = UNITS.find((u) => u.id === v.unitId)?.name;
  const [{ data: course }, { data: unit }] = await Promise.all([
    db.from("courses").select("id").eq("slug", v.courseSlug).maybeSingle(),
    unitName
      ? db.from("units").select("id").ilike("name", `%${unitName}%`).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // 2) Aluno (upsert por CPF).
  const { data: student, error: studentErr } = await db
    .from("students")
    .upsert(
      {
        full_name: v.fullName,
        cpf: v.cpf,
        rg: v.rg,
        birth_date: v.birthDate || null,
        sexo: v.sexo || null,
        estado_civil: v.estadoCivil || null,
        naturalidade: v.naturalidade,
        father_name: v.fatherName,
        mother_name: v.motherName,
        phone: v.phone,
        whatsapp: v.whatsapp,
        email: v.email,
        cep: v.cep,
        street: v.street,
        number: v.number,
        complement: v.complement || null,
        neighborhood: v.neighborhood,
        city: v.city,
        state: v.state,
      },
      { onConflict: "cpf" },
    )
    .select("id")
    .single();
  if (studentErr) throw studentErr;

  // 3) Matrícula (o nº é gerado por trigger e retornado).
  const { data: enrollment, error: enrollErr } = await db
    .from("enrollments")
    .insert({
      student_id: student.id,
      course_id: course?.id ?? null,
      unit_id: unit?.id ?? null,
      turno: v.turno || null,
      contract_version_id: contractVersionId,
      status: "pendente",
      accepted_terms: true,
      signed_at: new Date().toISOString(),
      signer_ip: ip,
      valor_matricula: toNumber(f.valorMatricula),
      num_mensalidades: f.numMensalidades ? parseInt(f.numMensalidades, 10) : null,
      valor_mensalidade: toNumber(f.valorMensalidade),
      valor_recebido: toNumber(f.valorMatricula),
      recebedor: f.recebedor || null,
      responsavel_id: responsavelId ?? null,
    })
    .select("id, enrollment_code")
    .single();
  if (enrollErr) throw enrollErr;

  const enrollmentId = enrollment.id as string;

  // 4) Documentos -> Storage + tabela.
  for (const type of Object.keys(docs) as DocType[]) {
    const file = docs[type];
    if (!file) continue;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${enrollmentId}/${type}.${ext}`;
    const up = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (!up.error) {
      await db.from("documents").insert({
        enrollment_id: enrollmentId,
        type,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }
  }

  // 5) Assinatura -> Storage + tabela.
  const sigBlob = dataUrlToBlob(signature.dataUrl);
  const sigPath = `${enrollmentId}/signature.png`;
  const sigUp = await supabase.storage.from("signatures").upload(sigPath, sigBlob, { upsert: true });
  await db.from("signatures").insert({
    enrollment_id: enrollmentId,
    method: signature.method,
    image_path: sigUp.error ? null : sigPath,
    typed_name: signature.typedName ?? null,
    ip,
    user_agent: navigator.userAgent,
  });

  return { enrollmentId, enrollmentCode: enrollment.enrollment_code, ip };
}
