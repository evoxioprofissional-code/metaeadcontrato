import { CalendarDays, Clock, GraduationCap, Users } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { useEnrollments } from "@/hooks/useEnrollments";

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export function AdminDashboard({ onOpen }: { onOpen: () => void }) {
  const { data: rows = [], isLoading } = useEnrollments();

  const total = rows.length;
  const hoje = rows.filter((r) => isToday(r.created_at)).length;
  const pendentes = rows.filter((r) => r.status === "pendente").length;
  const aprovadas = rows.filter((r) => r.status === "aprovada").length;

  const cards = [
    { label: "Total de matrículas", value: total, icon: GraduationCap },
    { label: "Hoje", value: hoje, icon: CalendarDays },
    { label: "Pendentes", value: pendentes, icon: Clock },
    { label: "Aprovadas", value: aprovadas, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="meta-card p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{isLoading ? "—" : c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Últimas matrículas</h2>
          <button onClick={onOpen} className="text-sm font-medium text-primary">
            Ver todas
          </button>
        </div>
        <div className="space-y-2">
          {rows.slice(0, 6).map((r) => (
            <div key={r.id} className="meta-card flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.students?.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.courses?.name ?? "—"} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
          {!isLoading && rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma matrícula ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
