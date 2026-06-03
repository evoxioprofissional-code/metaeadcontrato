import { onlyDigits } from "@/lib/masks";

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Busca endereço por CEP via ViaCEP. Retorna null se não encontrado/erro.
export async function lookupCep(cep: string): Promise<CepResult | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
