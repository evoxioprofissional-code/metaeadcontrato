# Design System — Grupo Educacional Meta

Referências: **Stripe, Notion, Linear, Framer, Vercel Dashboard, Raycast**. Visual premium,
limpo, corporativo. **Mobile First** sempre.

## Cores (tokens em `src/index.css`)
| Token | Claro | Uso |
|-------|-------|-----|
| Primária | `#1E40AF` → `hsl(226 71% 40%)` | ações principais, marca |
| Secundária | `#2563EB` → `hsl(221 83% 53%)` | destaques, links, acento |
| Sucesso | `#22C55E` → `hsl(142 71% 45%)` | aprovações, status ok |
| Alerta | `#F59E0B` → `hsl(38 92% 50%)` | avisos |
| Erro | `#EF4444` → `hsl(0 84% 60%)` | erros, rejeições |
| Fundo | `#F8FAFC` → `hsl(210 40% 98%)` | background claro |

Modo escuro: tons estilo **Vercel Dashboard** (fundo `hsl(222 47% 6%)`).

## Tipografia
- **Inter** (300–900), via Google Fonts. `font-size: 16px` mínimo em inputs (evita zoom no iOS).

## Princípios mobile
- Botões/campos grandes (alvo de toque ≥ 44px; `min-h-12`).
- Espaçamento confortável, navegação por etapas, barra de progresso fixa.
- `viewport-fit=cover` + `env(safe-area-inset-*)` (notch do iPhone).
- Teclado adequado por campo (`inputMode`, `type`), máscaras automáticas.
- Animações suaves (Framer Motion + utilitários CSS).

## Componentes/utilitários próprios
- Variantes de `Button`: `default`, `gradient`, `outline`, `secondary`, `ghost`, `link`, `destructive`;
  tamanhos `sm`/`default`/`lg`/`xl`/`icon`.
- Classes: `.meta-card`, `.meta-glass`, `.meta-touch`, `.bg-grid`, `.text-balance`.
- Sombras (`shadow-meta-*`) e gradientes (`bg-gradient-hero/button/accent`) por CSS vars.

## Breakpoints a testar
320 · 375 · 390 · 414 · 768 · 1024 · 1440.
