import { z } from "zod";

import { isValidCPF } from "./masks";

export const enrollmentSchema = z.object({
  // Etapa 1 — Dados pessoais
  fullName: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  rg: z.string().trim().min(3, "Informe o RG"),
  birthDate: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine((v) => {
      const d = new Date(v);
      return !Number.isNaN(d.getTime()) && d <= new Date();
    }, "Data inválida"),
  sexo: z.string().min(1, "Selecione uma opção"),
  estadoCivil: z.string().min(1, "Selecione o estado civil"),
  naturalidade: z.string().trim().min(2, "Informe a naturalidade"),
  fatherName: z.string().trim().min(3, "Informe o nome do pai"),
  motherName: z.string().trim().min(3, "Informe o nome da mãe"),

  // Etapa 2 — Contato
  phone: z.string().min(14, "Telefone incompleto"),
  whatsapp: z.string().min(14, "WhatsApp incompleto"),
  email: z.string().trim().email("E-mail inválido"),

  // Etapa 3 — Endereço
  cep: z.string().min(9, "CEP incompleto"),
  street: z.string().trim().min(2, "Informe a rua"),
  number: z.string().trim().min(1, "Nº"),
  complement: z.string().optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF"),

  // Etapa 4 — Curso
  courseSlug: z.string().min(1, "Selecione o curso"),
  turno: z.string().min(1, "Selecione o turno"),
  unitId: z.string().min(1, "Selecione a unidade"),
});

export type EnrollmentForm = z.infer<typeof enrollmentSchema>;

// Campos validados em cada etapa (para validação parcial ao avançar).
export const STEP_FIELDS: (keyof EnrollmentForm)[][] = [
  ["fullName", "cpf", "rg", "birthDate", "sexo", "estadoCivil", "naturalidade", "fatherName", "motherName"],
  ["phone", "whatsapp", "email"],
  ["cep", "street", "number", "neighborhood", "city", "state"],
  ["courseSlug", "turno", "unitId"],
  [], // Etapa 5 (documentos) é validada à parte
];

export const defaultEnrollment: EnrollmentForm = {
  fullName: "",
  cpf: "",
  rg: "",
  birthDate: "",
  sexo: "",
  estadoCivil: "",
  naturalidade: "",
  fatherName: "",
  motherName: "",
  phone: "",
  whatsapp: "",
  email: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  courseSlug: "",
  turno: "",
  unitId: "",
};
