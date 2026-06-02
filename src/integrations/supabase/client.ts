import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Aviso amigável em dev — evita tela branca silenciosa quando faltam as keys.
  console.warn(
    "[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY ausentes. " +
      "Copie .env.example para .env e preencha as chaves do projeto.",
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://zagbrydckxgmvvfrdpsy.supabase.co",
  SUPABASE_PUBLISHABLE_KEY ?? "public-anon-key-missing",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
