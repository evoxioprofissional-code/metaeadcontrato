import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

import { Field } from "@/components/matricula/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

interface StaffLoginProps {
  title?: string;
  subtitle?: string;
}

export function StaffLogin({ title = "Acesso da equipe", subtitle }: StaffLoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      // Distingue senha errada de erro de configuração/conexão (ex.: chave do Supabase ausente).
      if (/invalid login credentials/i.test(error)) {
        setError("E-mail ou senha incorretos.");
      } else if (/api key|apikey|failed to fetch|networkerror/i.test(error)) {
        setError("Falha de conexão com o servidor. Verifique as variáveis de ambiente do Supabase.");
      } else {
        setError(error);
      }
    }
  }

  return (
    <form onSubmit={submit} className="meta-card space-y-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <Field label="E-mail" htmlFor="staff-email">
        <Input
          id="staff-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@grupometa.com"
          required
        />
      </Field>

      <Field label="Senha" htmlFor="staff-password" error={error}>
        <Input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
        />
      </Field>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-5 animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}
