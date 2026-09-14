'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, toasts, dismissToast }}>
      {children}

      {/* Toast Notification Container */}
      <aside
        aria-label="Notification center"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-stone-900/95 text-stone-100 shadow-xl border border-stone-700/80 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            )}

            <div className="flex-1 text-xs">
              {toast.title && (
                <p className="font-semibold text-stone-200 mb-0.5">{toast.title}</p>
              )}
              <p className="text-stone-300 font-sans leading-relaxed">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-stone-400 hover:text-stone-100 p-0.5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      showToast: (msg: string) => {
        console.log('[Toast Notification]:', msg);
      },
      toasts: [],
      dismissToast: () => {},
    };
  }
  return context;
}
