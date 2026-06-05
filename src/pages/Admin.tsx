import { useState } from "react";
import { FileText, Inbox, LayoutDashboard, Link2, ListChecks, Loader2, LogOut, ShieldCheck } from "lucide-react";

import { AdminContratos } from "@/components/admin/AdminContratos";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminMatriculas } from "@/components/admin/AdminMatriculas";
import { AdminNovoLink } from "@/components/admin/AdminNovoLink";
import { AdminSolicitacoes } from "@/components/admin/AdminSolicitacoes";
import { StaffLogin } from "@/components/auth/StaffLogin";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Section = "dashboard" | "matriculas" | "solicitacoes" | "novo-link" | "contratos";

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "matriculas", label: "Matrículas", icon: ListChecks },
  { id: "solicitacoes", label: "Solicitações", icon: Inbox },
  { id: "novo-link", label: "Gerar link", icon: Link2 },
  { id: "contratos", label: "Contratos", icon: FileText },
];

export default function Admin() {
  const { loading, isStaff, user, signOut } = useAuth();
  const [section, setSection] = useState<Section>("dashboard");

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-5">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Painel administrativo</h1>
            <p className="text-sm text-muted-foreground">Grupo Educacional Meta</p>
          </div>
          <StaffLogin title="Entrar no painel" subtitle="Acesso restrito à equipe." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-bold tracking-tight">Meta Admin</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                section === n.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <n.icon className="size-5" />
              {n.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/60"
        >
          <LogOut className="size-5" />
          Sair
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl">
          <span className="font-semibold lg:hidden">Meta Admin</span>
          <span className="hidden text-sm text-muted-foreground lg:block">{user?.email}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Sair"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 lg:pb-6">
          {section === "dashboard" ? (
            <AdminDashboard onOpen={() => setSection("matriculas")} />
          ) : section === "matriculas" ? (
            <AdminMatriculas />
          ) : section === "solicitacoes" ? (
            <AdminSolicitacoes />
          ) : section === "novo-link" ? (
            <AdminNovoLink />
          ) : (
            <AdminContratos />
          )}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
              section === n.id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <n.icon className="size-5" />
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
