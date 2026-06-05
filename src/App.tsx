import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";

// Rotas carregadas sob demanda (code-splitting) — bundle inicial menor.
const Index = lazy(() => import("@/pages/Index"));
const Matricula = lazy(() => import("@/pages/Matricula"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/matricula" element={<Matricula />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
