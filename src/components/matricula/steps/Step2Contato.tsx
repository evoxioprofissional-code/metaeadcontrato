import { Controller, useFormContext } from "react-hook-form";
import { MessageCircle } from "lucide-react";

import { Field } from "@/components/matricula/Field";
import { Input } from "@/components/ui/input";
import type { EnrollmentForm } from "@/lib/enrollment-schema";
import { maskPhone } from "@/lib/masks";

export function Step2Contato() {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<EnrollmentForm>();

  return (
    <div className="space-y-5">
      <Field label="Telefone" htmlFor="phone" error={errors.phone?.message}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(94) 90000-0000"
              aria-invalid={!!errors.phone}
              value={field.value}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
            />
          )}
        />
      </Field>

      <Field
        label="WhatsApp"
        htmlFor="whatsapp"
        error={errors.whatsapp?.message}
        hint="Usaremos para falar sobre sua matrícula."
      >
        <Controller
          control={control}
          name="whatsapp"
          render={({ field }) => (
            <Input
              id="whatsapp"
              type="tel"
              inputMode="numeric"
              placeholder="(94) 90000-0000"
              aria-invalid={!!errors.whatsapp}
              value={field.value}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
            />
          )}
        />
      </Field>

      <button
        type="button"
        onClick={() => setValue("whatsapp", getValues("phone"), { shouldValidate: true })}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        <MessageCircle className="size-4" />
        Meu WhatsApp é o mesmo telefone
      </button>

      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="voce@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>
    </div>
  );
}
