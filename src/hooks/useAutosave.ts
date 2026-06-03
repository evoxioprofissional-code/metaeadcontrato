import { useEffect, useRef } from "react";

// Salva um objeto no localStorage com debounce (autosave do formulário).
export function useAutosave<T>(key: string, value: T, delay = 600) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage cheio/indisponível — ignora silenciosamente */
      }
    }, delay);

    return () => clearTimeout(timer.current);
  }, [key, value, delay]);
}

export function loadAutosave<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
