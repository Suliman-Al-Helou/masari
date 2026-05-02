'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    timers.current[id] = setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  const value: ToastContextValue = {
    success: (t, m) => add('success', t, m),
    error:   (t, m) => add('error',   t, m),
    warning: (t, m) => add('warning', t, m),
    info:    (t, m) => add('info',    t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" dir="rtl">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className={`toast-icon toast-icon-${toast.type}`}>
              {ICONS[toast.type]}
            </span>
            <div className="toast-body">
              <p className="toast-title">{toast.title}</p>
              {toast.message && <p className="toast-message">{toast.message}</p>}
            </div>
            <button className="toast-close" onClick={() => dismiss(toast.id)}>✕</button>
            <div className="toast-progress" style={{ animationDuration: `${DURATION}ms` }} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        .toast-viewport {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-width: 360px;
          width: calc(100vw - 3rem);
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: hsl(var(--card));
          border: 1.5px solid hsl(var(--border));
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          pointer-events: all;
          position: relative;
          overflow: hidden;
          animation: toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-family: var(--font-main);
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .toast-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .toast-icon-success { background: hsl(var(--success) / 0.15); color: hsl(var(--success)); }
        .toast-icon-error   { background: hsl(var(--destructive) / 0.15); color: hsl(var(--destructive)); }
        .toast-icon-warning { background: hsl(var(--warning) / 0.15); color: hsl(var(--warning)); }
        .toast-icon-info    { background: hsl(var(--info) / 0.15); color: hsl(var(--info)); }

        .toast-body { flex: 1; min-width: 0; }
        .toast-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 0;
          line-height: 1.4;
        }
        .toast-message {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
          margin: 0.2rem 0 0;
          line-height: 1.5;
        }

        .toast-close {
          background: none; border: none;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          font-size: 0.7rem;
          padding: 0.2rem;
          line-height: 1;
          flex-shrink: 0;
          opacity: 0.6;
          transition: opacity 0.15s;
        }
        .toast-close:hover { opacity: 1; }

        /* شريط التقدم في الأسفل */
        .toast-progress {
          position: absolute;
          bottom: 0; right: 0;
          height: 3px;
          border-radius: 0 0 12px 12px;
          animation: toast-progress linear forwards;
          width: 100%;
        }
        .toast-success .toast-progress { background: hsl(var(--success)); }
        .toast-error   .toast-progress { background: hsl(var(--destructive)); }
        .toast-warning .toast-progress { background: hsl(var(--warning)); }
        .toast-info    .toast-progress { background: hsl(var(--info)); }

        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}