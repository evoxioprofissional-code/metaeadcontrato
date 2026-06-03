import { useRef, useState } from "react";
import { Check, Eraser, Maximize2, PenLine, Type, Upload, X } from "lucide-react";

import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/matricula/DrawingCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SignatureMethod = "desenho" | "digitado" | "upload";
export interface SignatureValue {
  dataUrl: string;
  method: SignatureMethod;
  typedName?: string;
}

interface SignaturePadProps {
  value: SignatureValue | null;
  onChange: (v: SignatureValue | null) => void;
}

const TABS: { id: SignatureMethod; label: string; icon: typeof PenLine }[] = [
  { id: "desenho", label: "Desenhar", icon: PenLine },
  { id: "digitado", label: "Digitar", icon: Type },
  { id: "upload", label: "Enviar imagem", icon: Upload },
];

// Gera uma imagem de assinatura a partir do nome digitado.
function typedToDataUrl(name: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic 64px 'Segoe Script', 'Brush Script MT', cursive";
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const [tab, setTab] = useState<SignatureMethod>("desenho");
  const [typed, setTyped] = useState(value?.typedName ?? "");
  const [drawnPreview, setDrawnPreview] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const inlineRef = useRef<DrawingCanvasHandle>(null);
  const fullRef = useRef<DrawingCanvasHandle>(null);

  function commitDraw(dataUrl: string, preview = false) {
    if (preview) setDrawnPreview(dataUrl);
    onChange({ dataUrl, method: "desenho" });
  }

  function handleTyped(name: string) {
    setTyped(name);
    if (name.trim().length >= 2) {
      onChange({ dataUrl: typedToDataUrl(name.trim()), method: "digitado", typedName: name.trim() });
    } else {
      onChange(null);
    }
  }

  function handleUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ dataUrl: String(reader.result), method: "upload" });
    reader.readAsDataURL(file);
  }

  function reset() {
    inlineRef.current?.clear();
    setDrawnPreview(null);
    setTyped("");
    onChange(null);
  }

  return (
    <div className="space-y-3">
      {/* Abas */}
      <div className="grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              reset();
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-muted",
            )}
          >
            <t.icon className="size-4" />
            <span className="hidden xs:inline sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Desenhar */}
      {tab === "desenho" && (
        <div className="space-y-2">
          {drawnPreview ? (
            <div className="rounded-xl border border-success/40 bg-white p-2">
              <img src={drawnPreview} alt="Assinatura" className="mx-auto h-28 object-contain" />
            </div>
          ) : (
            <DrawingCanvas
              ref={inlineRef}
              className="h-40 border-2 border-dashed border-input"
              onStrokeEnd={() => {
                if (!inlineRef.current?.isEmpty()) commitDraw(inlineRef.current!.toDataURL());
              }}
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <Eraser className="size-4" />
              Limpar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setFullscreen(true)}>
              <Maximize2 className="size-4" />
              Assinar em tela cheia
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Assine com o dedo, caneta ou mouse.</p>
        </div>
      )}

      {/* Digitar */}
      {tab === "digitado" && (
        <div className="space-y-2">
          <Input
            value={typed}
            onChange={(e) => handleTyped(e.target.value)}
            placeholder="Digite seu nome completo"
            autoCapitalize="words"
          />
          {value?.method === "digitado" && (
            <div className="rounded-xl border border-input bg-white p-3 text-center">
              <span
                className="text-4xl text-slate-900"
                style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontStyle: "italic" }}
              >
                {typed}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload */}
      {tab === "upload" && (
        <div className="space-y-2">
          {value?.method === "upload" ? (
            <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-white p-2">
              <img src={value.dataUrl} alt="Assinatura" className="h-24 object-contain" />
              <Button type="button" variant="ghost" size="sm" onClick={reset} className="ml-auto">
                <X className="size-4" />
                Trocar
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-input bg-background px-4 py-8 text-center hover:border-primary">
              <Upload className="size-6 text-primary" />
              <span className="text-sm font-medium">Enviar imagem da assinatura</span>
              <span className="text-xs text-muted-foreground">PNG ou JPG</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
      )}

      {value && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-success">
          <Check className="size-4" />
          Assinatura registrada
        </p>
      )}

      {/* Modal tela cheia */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background p-4" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Assine na tela</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => setFullscreen(false)} aria-label="Fechar">
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 rounded-2xl border-2 border-dashed border-input bg-white">
            <DrawingCanvas ref={fullRef} className="h-full" />
          </div>
          <p className="py-2 text-center text-xs text-muted-foreground">
            Vire o aparelho na horizontal para mais espaço.
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => fullRef.current?.clear()}>
              <Eraser className="size-5" />
              Limpar
            </Button>
            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="flex-[2]"
              onClick={() => {
                if (fullRef.current && !fullRef.current.isEmpty()) {
                  commitDraw(fullRef.current.toDataURL(), true);
                }
                setFullscreen(false);
              }}
            >
              <Check className="size-5" />
              Usar assinatura
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
