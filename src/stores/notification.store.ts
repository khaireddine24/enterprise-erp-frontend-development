import { create } from "zustand";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  severity: "info" | "success" | "warning" | "danger";
}

interface NotificationState {
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  push: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  unreadCount: () => number;
}

const now = Date.now();
const seed: NotificationItem[] = [
  { id: "ntf_001", type: "invoice_created", title: "Invoice INV-2026-1841 created", message: "Acme Corp — $24,500.00 due Sep 20, 2026.", link: "/sales/invoices", read: false, createdAt: new Date(now - 1000 * 60 * 12).toISOString(), severity: "info" },
  { id: "ntf_002", type: "payment_received", title: "Payment received — $18,200", message: "Globex Ltd settled INV-2026-1802 via bank transfer.", link: "/sales/payments", read: false, createdAt: new Date(now - 1000 * 60 * 47).toISOString(), severity: "success" },
  { id: "ntf_003", type: "low_stock", title: "Low stock alert", message: "Ergo Chair Pro (SKU-CHA-104) — only 8 units left in WH-East.", link: "/inventory/products", read: false, createdAt: new Date(now - 1000 * 60 * 95).toISOString(), severity: "warning" },
  { id: "ntf_004", type: "approval_request", title: "Approval requested", message: "PO-2026-0931 ($42,800) is awaiting your approval.", link: "/approvals", read: false, createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(), severity: "warning" },
  { id: "ntf_005", type: "leave_request", title: "Leave request", message: "Daniel Okafor requested Sep 14–18 (annual leave).", link: "/hr/leaves", read: false, createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(), severity: "info" },
  { id: "ntf_006", type: "task_assigned", title: "Task assigned to you", message: "“Q3 close checklist” — due Sep 10, priority high.", link: "/projects/tasks", read: true, createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(), severity: "info" },
  { id: "ntf_007", type: "deadline", title: "Deadline approaching", message: "Project “Atlas Rollout” milestone due in 3 days.", link: "/projects", read: true, createdAt: new Date(now - 1000 * 60 * 60 * 9).toISOString(), severity: "danger" },
  { id: "ntf_008", type: "system", title: "Payroll draft ready", message: "August payroll draft is ready for review.", link: "/hr/payroll", read: true, createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(), severity: "info" },
];

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: seed,
  markAsRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllAsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  push: (n) =>
    set((s) => ({
      notifications: [{ ...n, id: `ntf_${Date.now()}`, createdAt: new Date().toISOString(), read: false }, ...s.notifications],
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
