import { COURSES, ESTADO_CIVIL_OPTS } from "@/data/catalog";
import type { EnrollmentForm } from "@/lib/enrollment-schema";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Espaço em branco preenchível (campos que a escola define depois, ex.: valores).
const BLANK = '<span class="contract-blank">&nbsp;</span>';

export function mergeContract(html: string, data: Record<string, string | undefined>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = data[key];
    return v && v.trim() ? escapeHtml(v) : BLANK;
  });
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

// Monta os valores dos tokens {{...}} a partir dos dados do formulário.
// Valores financeiros/duração ficam em branco (definidos pela escola no admin).
export function buildContractData(v: EnrollmentForm): Record<string, string> {
  const curso = COURSES.find((c) => c.slug === v.courseSlug)?.name ?? "";
  const estadoCivil = ESTADO_CIVIL_OPTS.find((e) => e.value === v.estadoCivil)?.label ?? "";
  const hoje = new Date().toLocaleDateString("pt-BR");

  return {
    curso,
    aluno_nome: v.fullName,
    cpf: v.cpf,
    rg: v.rg,
    data_nascimento: formatDate(v.birthDate),
    naturalidade: v.naturalidade,
    estado_civil: estadoCivil,
    endereco_rua: [v.street, v.number].filter(Boolean).join(", "),
    endereco_bairro: v.neighborhood,
    endereco_cidade: [v.city, v.state].filter(Boolean).join(" - "),
    telefone: v.phone,
    pai: v.fatherName,
    mae: v.motherName,
    email: v.email,
    valor_matricula: "",
    num_mensalidades: "",
    valor_mensalidade: "",
    duracao: "",
    data: hoje,
  };
}
