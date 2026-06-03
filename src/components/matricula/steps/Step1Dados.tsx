import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@/components/matricula/Field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADO_CIVIL_OPTS, SEXO_OPTS } from "@/data/catalog";
import type { EnrollmentForm } from "@/lib/enrollment-schema";
import { maskCPF } from "@/lib/masks";
import { cn } from "@/lib/utils";

export function Step1Dados() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EnrollmentForm>();

  return (
    <div className="space-y-5">
      <Field label="Nome completo" htmlFor="fullName" error={errors.fullName?.message}>
        <Input
          id="fullName"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Como no seu documento"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CPF" htmlFor="cpf" error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-invalid={!!errors.cpf}
                value={field.value}
                onChange={(e) => field.onChange(maskCPF(e.target.value))}
              />
            )}
          />
        </Field>

        <Field label="RG" htmlFor="rg" error={errors.rg?.message}>
          <Input
            id="rg"
            inputMode="text"
            placeholder="00.000.000-0"
            aria-invalid={!!errors.rg}
            {...register("rg")}
          />
        </Field>
      </div>

      <Field label="Data de nascimento" htmlFor="birthDate" error={errors.birthDate?.message}>
        <Input
          id="birthDate"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          aria-invalid={!!errors.birthDate}
          {...register("birthDate")}
        />
      </Field>

      <Field label="Sexo" error={errors.sexo?.message}>
        <Controller
          control={control}
          name="sexo"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-2.5"
            >
              {SEXO_OPTS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors",
                    field.value === opt.value && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Estado civil" error={errors.estadoCivil?.message}>
          <Controller
            control={control}
            name="estadoCivil"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.estadoCivil}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_CIVIL_OPTS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Naturalidade" htmlFor="naturalidade" error={errors.naturalidade?.message}>
          <Input
            id="naturalidade"
            autoCapitalize="words"
            placeholder="Cidade onde nasceu"
            aria-invalid={!!errors.naturalidade}
            {...register("naturalidade")}
          />
        </Field>
      </div>

      <Field label="Nome do pai" htmlFor="fatherName" error={errors.fatherName?.message}>
        <Input
          id="fatherName"
          autoComplete="off"
          autoCapitalize="words"
          placeholder="Nome completo do pai"
          aria-invalid={!!errors.fatherName}
          {...register("fatherName")}
        />
      </Field>

      <Field label="Nome da mãe" htmlFor="motherName" error={errors.motherName?.message}>
        <Input
          id="motherName"
          autoComplete="off"
          autoCapitalize="words"
          placeholder="Nome completo da mãe"
          aria-invalid={!!errors.motherName}
          {...register("motherName")}
        />
      </Field>
    </div>
  );
}
