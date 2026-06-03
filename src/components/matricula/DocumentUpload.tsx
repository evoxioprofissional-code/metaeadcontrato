import { useRef, useState } from "react";
import { FileText, ImageIcon, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  label: string;
  file?: File;
  onSelect: (file: File | undefined) => void;
}

const ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";
const MAX_MB = 8;

export function DocumentUpload({ label, file, onSelect }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>();

  const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

  function handleFile(f?: File) {
    setError(undefined);
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Máximo ${MAX_MB}MB`);
      return;
    }
    onSelect(f);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-3">
        {preview ? (
          <img src={preview} alt={label} className="size-14 rounded-lg object-cover" />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{file.name}</p>
        </div>
        <button
          type="button"
          aria-label={`Remover ${label}`}
          onClick={() => onSelect(undefined)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <X className="size-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-input bg-background px-4 py-6 text-center transition-colors",
          dragOver && "border-primary bg-primary/5",
          error && "border-destructive",
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {label.toLowerCase().includes("comprovante") ? (
            <FileText className="size-5" />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </div>
        <span className="text-sm font-medium">{label}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <UploadCloud className="size-3.5" />
          Toque para enviar ou arraste aqui
        </span>
      </button>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
