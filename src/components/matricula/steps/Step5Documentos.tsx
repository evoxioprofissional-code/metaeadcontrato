import { DocumentUpload } from "@/components/matricula/DocumentUpload";

export type DocType = "rg_frente" | "rg_verso" | "cpf" | "comprovante_residencia";
export type DocFiles = Partial<Record<DocType, File>>;

const SLOTS: { type: DocType; label: string }[] = [
  { type: "rg_frente", label: "RG — frente" },
  { type: "rg_verso", label: "RG — verso" },
  { type: "comprovante_residencia", label: "Comprovante de residência" },
];

interface Step5Props {
  files: DocFiles;
  onChange: (type: DocType, file: File | undefined) => void;
  error?: string;
}

export function Step5Documentos({ files, onChange, error }: Step5Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Envie fotos legíveis. Aceitamos imagem ou PDF (até 8MB cada).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SLOTS.map((slot) => (
          <DocumentUpload
            key={slot.type}
            label={slot.label}
            file={files[slot.type]}
            onSelect={(f) => onChange(slot.type, f)}
          />
        ))}
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
