"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useMemo,
} from "react";
import { ToastViewport, ToastItem, ToastType } from "@/components/ui/Toast";

interface ToastContextValue {
  Success: (title: string, message?: string) => void;
  Error: (title: string, message?: string) => void;
  Warning: (title: string, message?: string) => void;
  Info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const value: ToastContextValue = useMemo(
    () => ({
      Success: (t, m) => add("success", t, m),
      Error: (t, m) => add("error", t, m),
      Warning: (t, m) => add("warning", t, m),
      Info: (t, m) => add("info", t, m),
    }),
    [add],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} duration={DURATION} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}