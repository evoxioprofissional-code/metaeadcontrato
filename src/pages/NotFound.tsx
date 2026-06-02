import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-primary">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">O endereço acessado não existe ou foi movido.</p>
      </div>
      <Button asChild variant="gradient" size="lg">
        <Link to="/">
          <ArrowLeft className="size-5" />
          Voltar ao início
        </Link>
      </Button>
    </main>
  );
}
