import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: "success" | "error" | "info";
}

interface ToastState {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  toast: (t) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function toast(title: string, opts?: { message?: string; variant?: Toast["variant"] }) {
  useToastStore.getState().toast({ title, message: opts?.message, variant: opts?.variant ?? "success" });
}
