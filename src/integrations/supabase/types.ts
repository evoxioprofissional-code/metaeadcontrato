// Tipos do banco — gerados pelo Supabase CLI:
//   npx supabase gen types typescript --project-id zagbrydckxgmvvfrdpsy > src/integrations/supabase/types.ts
// Placeholder até a primeira geração (Fase 0 cria o schema via migration 0001_init.sql).

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
