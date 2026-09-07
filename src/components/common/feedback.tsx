/* Shared enterprise components: headers, stats, badges, states, dialogs, timelines. */
import * as React from "react";
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, FileText,
  Inbox, Lock, RefreshCw, ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import { humanize } from "@/utils/helpers";
import { STATUS_COLORS } from "@/constants/app";
import { Avatar, Badge, Button, Card, CardContent, Dialog, Separator, Skeleton } from "@/components/ui/primitives";

/* ---------- Page scaffolding ---------- */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function PageHeader({ title, description, actions, breadcrumbs }: {
  title: string; description?: string; actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span aria-hidden>/</span>}
                {b.to ? <Link to={b.to} className="hover:text-foreground hover:underline">{b.label}</Link> : <span className="text-foreground">{b.label}</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ label, value, delta, deltaLabel, icon, tone = "default", loading }: {
  label: string; value: string; delta?: number; deltaLabel?: string;
  icon?: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/12 text-red-600 dark:text-red-400",
    info: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  };
  if (loading) {
    return (
      <Card><CardContent className="pt-5 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-20" /></CardContent></Card>
    );
  }
  const positive = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          {icon && <span className={cn("rounded-lg p-2", tones[tone])}>{icon}</span>}
        </div>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        {delta !== undefined && (
          <p className={cn("mt-1.5 flex items-center gap-1 text-xs font-semibold", positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {positive ? "+" : ""}{delta.toFixed(1)}%
            {deltaLabel && <span className="font-normal text-muted-foreground"> {deltaLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Status badge ---------- */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = STATUS_COLORS[status] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {humanize(status)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, "secondary" | "info" | "warning" | "danger"> = { low: "secondary", medium: "info", high: "warning", urgent: "danger" };
  return <Badge variant={map[priority] ?? "secondary"}>{humanize(priority)}</Badge>;
}

/* ---------- Avatars / entity ---------- */
export function EntityCell({ name, sub, avatarName }: { name: string; sub?: string; avatarName?: string }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Avatar name={avatarName ?? name} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{name}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/* ---------- States ---------- */
export function EmptyState({ title = "No data", description = "There is nothing to show here yet.", action }: {
  title?: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="rounded-full bg-muted p-3.5 text-muted-foreground"><Inbox className="h-6 w-6" aria-hidden /></span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message = "We couldn't load this data. Please try again.", onRetry }: {
  title?: string; message?: string; onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="rounded-full bg-red-500/10 p-3.5 text-red-600 dark:text-red-400"><AlertTriangle className="h-6 w-6" aria-hidden /></span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}><CardContent className="pt-5 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-20" /></CardContent></Card>
      ))}
    </div>
  );
}

export function PermissionDenied({ module = "this module" }: { module?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="rounded-full bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400"><ShieldAlert className="h-7 w-7" aria-hidden /></span>
      <p className="text-base font-semibold">Access denied</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">Your role doesn't have permission to access {module}. Contact your administrator if you need access.</p>
      <Link to="/dashboard"><Button variant="outline" size="sm" className="mt-2">Back to dashboard</Button></Link>
    </div>
  );
}

export function SessionLocked() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="rounded-full bg-muted p-4 text-muted-foreground"><Lock className="h-7 w-7" aria-hidden /></span>
      <p className="text-base font-semibold">Session expired</p>
      <p className="text-[13px] text-muted-foreground">Please sign in again to continue.</p>
      <Link to="/login"><Button size="sm" className="mt-2">Sign in</Button></Link>
    </div>
  );
}

/* ---------- Confirm / delete dialogs ---------- */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
  confirmLabel?: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} width="max-w-md">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Dialog>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 px-4 py-2.5 text-[13px] text-emerald-800 dark:text-emerald-200" role="status">
      <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
    </div>
  );
}

/* ---------- Timelines ---------- */
export function ActivityTimeline({ items }: { items: { id: string; user: string; action: string; entity?: string; time: string }[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5 ml-1.5">
      {items.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute -left-[26px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" aria-hidden />
          <p className="text-[13px]"><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> {a.entity && <span className="font-medium text-primary">{a.entity}</span>}</p>
          <p className="text-xs text-muted-foreground">{a.time}</p>
        </li>
      ))}
    </ol>
  );
}

export function ApprovalTimeline({ steps }: { steps: { step: string; by: string; action: string; at: string; comment?: string }[] }) {
  if (steps.length === 0) return <p className="text-[13px] text-muted-foreground">No approval history yet.</p>;
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <Avatar name={s.by} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px]"><span className="font-semibold">{s.by}</span> <StatusBadge status={s.action} className="ml-1" /></p>
            <p className="text-xs text-muted-foreground">{s.step} · {s.at}</p>
            {s.comment && <p className="mt-1 text-[13px] italic text-muted-foreground">“{s.comment}”</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Detail rows ---------- */
export function DetailGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <div key={i}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DocTotals({ subtotal, discount, tax, total, paid, balance }: {
  subtotal: string; discount?: string; tax: string; total: string; paid?: string; balance?: string;
}) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
      <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{subtotal}</span></div>
      {discount && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>−{discount}</span></div>}
      <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{tax}</span></div>
      <Separator />
      <div className="flex justify-between text-base font-bold"><span>Total</span><span>{total}</span></div>
      {paid !== undefined && <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Paid</span><span>{paid}</span></div>}
      {balance !== undefined && <div className="flex justify-between font-semibold"><span>Balance due</span><span>{balance}</span></div>}
    </div>
  );
}

export function DocNote() {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
      <FileText className="h-4 w-4 shrink-0 mt-0.5" />
      <p>This is a system-generated preview. Use Print to produce the official document with company letterhead, or Export for CSV/Excel.</p>
    </div>
  );
}
