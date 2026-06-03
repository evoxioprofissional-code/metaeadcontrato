import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/matricula/Field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UF_OPTS } from "@/data/catalog";
import type { EnrollmentForm } from "@/lib/enrollment-schema";
import { maskCEP, onlyDigits } from "@/lib/masks";
import { lookupCep } from "@/services/cep";

export function Step3Endereco() {
  const {
    register,
    control,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<EnrollmentForm>();
  const [loadingCep, setLoadingCep] = useState(false);

  async function handleCep(value: string) {
    if (onlyDigits(value).length !== 8) return;
    setLoadingCep(true);
    const result = await lookupCep(value);
    setLoadingCep(false);
    if (!result) {
      toast.error("CEP não encontrado. Preencha o endereço manualmente.");
      return;
    }
    setValue("street", result.street, { shouldValidate: true });
    setValue("neighborhood", result.neighborhood, { shouldValidate: true });
    setValue("city", result.city, { shouldValidate: true });
    setValue("state", result.state, { shouldValidate: true });
    setFocus("number");
  }

  return (
    <div className="space-y-5">
      <Field label="CEP" htmlFor="cep" error={errors.cep?.message} hint="Buscamos o endereço pra você.">
        <Controller
          control={control}
          name="cep"
          render={({ field }) => (
            <div className="relative">
              <Input
                id="cep"
                inputMode="numeric"
                placeholder="00000-000"
                aria-invalid={!!errors.cep}
                value={field.value}
                onChange={(e) => {
                  const masked = maskCEP(e.target.value);
                  field.onChange(masked);
                  handleCep(masked);
                }}
              />
              {loadingCep && (
                <Loader2 className="absolute right-3 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
        />
      </Field>

      <div className="grid grid-cols-[1fr_6rem] gap-4">
        <Field label="Rua" htmlFor="street" error={errors.street?.message}>
          <Input id="street" autoComplete="address-line1" aria-invalid={!!errors.street} {...register("street")} />
        </Field>
        <Field label="Número" htmlFor="number" error={errors.number?.message}>
          <Input id="number" inputMode="numeric" aria-invalid={!!errors.number} {...register("number")} />
        </Field>
      </div>

      <Field label="Complemento" htmlFor="complement" hint="Opcional">
        <Input id="complement" placeholder="Apto, bloco, referência" {...register("complement")} />
      </Field>

      <Field label="Bairro" htmlFor="neighborhood" error={errors.neighborhood?.message}>
        <Input id="neighborhood" aria-invalid={!!errors.neighborhood} {...register("neighborhood")} />
      </Field>

      <div className="grid grid-cols-[1fr_6rem] gap-4">
        <Field label="Cidade" htmlFor="city" error={errors.city?.message}>
          <Input id="city" autoComplete="address-level2" aria-invalid={!!errors.city} {...register("city")} />
        </Field>
        <Field label="UF" error={errors.state?.message}>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.state}>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {UF_OPTS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </div>
  );
}
