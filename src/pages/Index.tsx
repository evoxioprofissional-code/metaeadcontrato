import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ShieldCheck, Sparkles, Clock } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Clock, title: "Em poucos minutos", desc: "Matrícula 100% online, sem filas." },
  { icon: ShieldCheck, title: "Assinatura digital", desc: "Válida, segura e com registro de IP." },
  { icon: Sparkles, title: "Experiência premium", desc: "Pensada primeiro para o seu celular." },
];

export default function Index() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Fundo decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gradient-accent opacity-20 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-button text-primary-foreground shadow-meta-md">
            <GraduationCap className="size-6" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Grupo Meta</p>
            <p className="text-[11px] text-muted-foreground">Educacional</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-24 pt-10 text-center sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Matrículas abertas · 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Faça sua matrícula{" "}
          <span className="bg-gradient-accent bg-clip-text text-transparent">online</span> em
          poucos minutos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          Preencha seus dados, assine digitalmente e garanta sua vaga sem sair de casa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button variant="gradient" size="xl" className="w-full sm:w-auto" disabled>
            Iniciar Matrícula
            <ArrowRight className="size-5" />
          </Button>
        </motion.div>
        <p className="mt-3 text-xs text-muted-foreground">
          O formulário multietapas chega na <strong>Fase 1</strong>.
        </p>

        {/* Features */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-16 grid w-full gap-4 sm:grid-cols-3"
        >
          {features.map((f) => (
            <li key={f.title} className="meta-card flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-6" />
              </div>
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </li>
          ))}
        </motion.ul>

        <p className="mt-16 text-xs text-muted-foreground">
          Fundação pronta · Design system, tema claro/escuro e Supabase configurados.
        </p>
      </main>
    </div>
  );
}
