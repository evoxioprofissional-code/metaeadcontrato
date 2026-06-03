// Catálogo de apoio ao formulário (espelha o seed em supabase/migrations/0001_init.sql).
// Na Fase 4 isto pode passar a ser carregado do Supabase no painel admin.

export const COURSES = [
  { slug: "informatica-infantil", name: "Informática Infantil — Aprendendo Brincando" },
  { slug: "agente-comunitario-saude", name: "Agente Comunitário de Saúde — Formação Completa" },
  { slug: "informatica-avancada", name: "Informática Avançada" },
  { slug: "informatica-basica", name: "Informática Básica" },
  { slug: "auxiliar-administrativo", name: "Auxiliar Administrativo" },
  { slug: "atendente-farmacia", name: "Atendente de Farmácia" },
  { slug: "operador-caixa", name: "Operador de Caixa" },
] as const;

export const UNITS = [
  { id: "maraba", name: "Marabá" },
  { id: "sao-domingos", name: "São Domingos do Araguaia" },
  { id: "itupiranga", name: "Itupiranga" },
] as const;

export const TURNOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "integral", label: "Integral" },
] as const;

export const SEXO_OPTS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "outro", label: "Outro" },
  { value: "nao_informar", label: "Prefiro não informar" },
] as const;

export const ESTADO_CIVIL_OPTS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União estável" },
] as const;

export const UF_OPTS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
