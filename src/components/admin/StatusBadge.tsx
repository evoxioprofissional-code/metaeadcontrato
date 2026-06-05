import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning" },
  aprovada: { label: "Aprovada", cls: "bg-success/15 text-success" },
  rejeitada: { label: "Rejeitada", cls: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", s.cls)}>
      {s.label}
    </span>
  );
}
