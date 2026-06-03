import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@/components/matricula/Field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSES, TURNOS, UNITS } from "@/data/catalog";
import type { EnrollmentForm } from "@/lib/enrollment-schema";
import { cn } from "@/lib/utils";

export function Step4Curso() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EnrollmentForm>();

  return (
    <div className="space-y-5">
      <Field label="Curso" error={errors.courseSlug?.message}>
        <Controller
          control={control}
          name="courseSlug"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.courseSlug}>
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {COURSES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Turno" error={errors.turno?.message}>
        <Controller
          control={control}
          name="turno"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {TURNOS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => field.onChange(t.value)}
                  className={cn(
                    "rounded-xl border border-input bg-background px-3 py-3 text-sm font-medium transition-colors",
                    field.value === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        />
      </Field>

      <Field label="Unidade" error={errors.unitId?.message}>
        <Controller
          control={control}
          name="unitId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.unitId}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
    </div>
  );
}
