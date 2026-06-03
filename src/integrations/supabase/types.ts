// Tipos do banco — gerados pelo Supabase CLI.
// Geração (requer Docker rodando OU access token):
//   npx supabase gen types typescript --project-id zagbrydckxgmvvfrdpsy > src/integrations/supabase/types.ts
//   (ou) npx supabase gen types typescript --db-url "<connection-string>" > ...   # precisa de Docker
// Placeholder até a geração. O schema vive em supabase/migrations/0001_init.sql (já aplicado).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
