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

export interface Financeiro {
  valorMatricula?: string;
  numMensalidades?: string;
  valorMensalidade?: string;
  duracao?: string;
  recebedor?: string;
  aposVencimento?: string;
  camisa?: string;
}

// Monta os valores dos tokens {{...}} a partir dos dados do aluno + dados do responsável.
// Campos financeiros vêm da "etapa do responsável"; sem eles, ficam em branco.
export function buildContractData(v: EnrollmentForm, f: Financeiro = {}): Record<string, string> {
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
    valor_matricula: f.valorMatricula ?? "",
    num_mensalidades: f.numMensalidades ?? "",
    valor_mensalidade: f.valorMensalidade ?? "",
    duracao: f.duracao ?? "",
    recebedor: f.recebedor ?? "",
    apos_vencimento: f.aposVencimento ?? "",
    camisa: f.camisa ?? "",
    data: hoje,
  };
}
