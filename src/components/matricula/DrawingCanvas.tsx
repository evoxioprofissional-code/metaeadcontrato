import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface DrawingCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface DrawingCanvasProps {
  className?: string;
  onStrokeEnd?: () => void;
}

// Canvas de assinatura — funciona com dedo, caneta touch e mouse (Pointer Events).
export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ className, onStrokeEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const dirty = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);

    function ctxOf() {
      const c = canvasRef.current!;
      return c.getContext("2d")!;
    }

    function setup() {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      const ctx = ctxOf();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = "#0f172a";
    }

    useEffect(() => {
      setup();
      const onResize = () => {
        // Redimensiona preservando o traço atual.
        const c = canvasRef.current;
        if (!c) return;
        const data = dirty.current ? c.toDataURL() : null;
        setup();
        if (data) {
          const img = new Image();
          img.onload = () => ctxOf().drawImage(img, 0, 0, c.getBoundingClientRect().width, c.getBoundingClientRect().height);
          img.src = data;
        }
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function pos(e: React.PointerEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function start(e: React.PointerEvent) {
      e.preventDefault();
      canvasRef.current!.setPointerCapture(e.pointerId);
      drawing.current = true;
      last.current = pos(e);
    }

    function move(e: React.PointerEvent) {
      if (!drawing.current) return;
      e.preventDefault();
      const p = pos(e);
      const ctx = ctxOf();
      ctx.beginPath();
      ctx.moveTo(last.current!.x, last.current!.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last.current = p;
      dirty.current = true;
    }

    function end() {
      if (!drawing.current) return;
      drawing.current = false;
      last.current = null;
      onStrokeEnd?.();
    }

    useImperativeHandle(ref, () => ({
      clear: () => {
        const c = canvasRef.current;
        if (!c) return;
        ctxOf().clearRect(0, 0, c.width, c.height);
        dirty.current = false;
      },
      isEmpty: () => !dirty.current,
      toDataURL: () => canvasRef.current!.toDataURL("image/png"),
    }));

    return (
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className={cn("w-full touch-none rounded-xl bg-white", className)}
      />
    );
  },
);
DrawingCanvas.displayName = "DrawingCanvas";
