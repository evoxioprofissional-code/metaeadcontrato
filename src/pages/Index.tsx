import { motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  Briefcase,
  Cpu,
  FileSignature,
  GraduationCap,
  IdCard,
  Monitor,
  Pill,
  ShoppingCart,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

import { Link } from "react-router-dom";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: IdCard,
    title: "Seus dados",
    desc: "Preencha nome, CPF, contato e endereço. O CEP completa o resto sozinho.",
  },
  {
    icon: UploadCloud,
    title: "Documentos",
    desc: "Envie RG, CPF e comprovante de residência direto pela câmera do celular.",
  },
  {
    icon: FileSignature,
    title: "Assinatura",
    desc: "Leia o contrato, assine na tela com o dedo e receba o comprovante por e-mail.",
  },
];

const courses = [
  { icon: Blocks, name: "Informática Infantil — Aprendendo Brincando" },
  { icon: Stethoscope, name: "Agente Comunitário de Saúde" },
  { icon: Cpu, name: "Informática Avançada" },
  { icon: Monitor, name: "Informática Básica" },
  { icon: Briefcase, name: "Auxiliar Administrativo" },
  { icon: Pill, name: "Atendente de Farmácia" },
  { icon: ShoppingCart, name: "Operador de Caixa" },
];

export default function Index() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Grupo Educacional Meta</p>
              <p className="text-[11px] text-muted-foreground">Seu sucesso é nossa meta</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-[26rem] bg-gradient-hero opacity-[0.07]" />
        <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-12 text-center sm:pt-20">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            Há mais de 10 anos capacitando para o mercado de trabalho
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
          >
            Faça sua matrícula online em poucos minutos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            Preencha seus dados, assine digitalmente e garanta sua vaga sem sair de casa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex justify-center"
          >
            <Button variant="gradient" size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/matricula">
                Iniciar matrícula
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Como funciona</h2>
          <p className="mt-2 text-muted-foreground">Três passos, tudo pelo celular.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="meta-card relative p-6">
              <span className="absolute right-5 top-5 text-3xl font-extrabold text-muted/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Cursos */}
      <section id="cursos" className="mx-auto max-w-5xl scroll-mt-20 px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cursos disponíveis</h2>
            <p className="mt-2 text-muted-foreground">Escolha o seu na hora da matrícula.</p>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {courses.map((c) => (
            <li
              key={c.name}
              className="meta-card flex flex-col gap-3 p-5 hover:border-primary/40"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <c.icon className="size-5" />
              </div>
              <span className="text-sm font-medium leading-snug">{c.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 Grupo Educacional Meta</span>
          <span>Marabá · São Domingos do Araguaia · Itupiranga — Pará</span>
        </div>
      </footer>
    </div>
  );
}
