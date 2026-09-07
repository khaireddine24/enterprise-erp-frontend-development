/* Design-system primitives (shadcn-style, Tailwind v4 tokens). */
import * as React from "react";
import { cn } from "@/utils/cn";

/* ---------- Button ---------- */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-card hover:bg-muted text-foreground",
  ghost: "hover:bg-muted text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
};
const btnSizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs rounded-md",
  sm: "h-8 px-3 text-[13px] rounded-md",
  md: "h-9 px-4 text-sm rounded-md",
  lg: "h-10 px-5 text-sm rounded-lg",
  icon: "h-9 w-9 rounded-md",
  "icon-sm": "h-8 w-8 rounded-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

/* ---------- Input / Textarea / Select / Label ---------- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      error ? "border-destructive" : "border-input",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, placeholder, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", className)}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options?.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-foreground", className)} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1" role="alert">{message}</p>;
}

export function FormField({ label, error, required, children, className }: { label?: string; error?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      <FieldError message={error} />
    </div>
  );
}

/* ---------- Checkbox / Switch ---------- */
export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-input accent-primary cursor-pointer", className)}
      {...props}
    />
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle"}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors h-[22px]", checked ? "bg-primary" : "bg-muted-foreground/30")}
    >
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-[3px]")} />
    </button>
  );
}

/* ---------- Badge ---------- */
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "secondary" | "outline";
const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/12 text-red-700 dark:text-red-400",
  info: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
  secondary: "bg-muted text-muted-foreground",
  outline: "border border-border text-foreground",
};
export function Badge({ variant = "default", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", badgeStyles[variant], className)} {...props} />;
}

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-3 px-5 pt-4 pb-3", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-tight", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

/* ---------- Avatar ---------- */
const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600", "bg-indigo-600"];
export function Avatar({ name, size = "md", className }: { name: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const color = avatarColors[name.length % avatarColors.length];
  const sizes = { xs: "h-6 w-6 text-[10px]", sm: "h-8 w-8 text-xs", md: "h-9 w-9 text-[13px]", lg: "h-12 w-12 text-base" };
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", color, sizes[size], className)} aria-hidden>
      {initials}
    </span>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

/* ---------- Separator / Progress ---------- */
export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} role="separator" />;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ---------- Alert ---------- */
export function Alert({ variant = "info", className, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "info" | "success" | "warning" | "danger" }) {
  const styles = {
    info: "border-sky-500/30 bg-sky-500/8 text-sky-900 dark:text-sky-200",
    success: "border-emerald-500/30 bg-emerald-500/8 text-emerald-900 dark:text-emerald-200",
    warning: "border-amber-500/30 bg-amber-500/8 text-amber-900 dark:text-amber-200",
    danger: "border-red-500/30 bg-red-500/8 text-red-900 dark:text-red-200",
  };
  return <div role="alert" className={cn("rounded-lg border px-4 py-3 text-[13px]", styles[variant], className)} {...props} />;
}

/* ---------- Dialog ---------- */
export function Dialog({ open, onClose, title, description, children, width = "max-w-lg" }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; width?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className={cn("relative w-full rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto", width)}>
        <div className="sticky top-0 bg-card px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
          <button onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Dropdown ---------- */
export function Dropdown({ trigger, items, align = "right" }: {
  trigger: React.ReactNode;
  items: { label: string; icon?: React.ReactNode; danger?: boolean; onClick: () => void }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open ]);
  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div className={cn("absolute z-40 mt-1.5 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-xl", align === "right" ? "right-0" : "left-0")} role="menu">
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={() => { item.onClick(); setOpen(false); }}
              className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] hover:bg-muted", item.danger ? "text-destructive" : "text-foreground")}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({ tabs, value, onChange }: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Tabs">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors -mb-px",
            value === t.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Tooltip (CSS-only) ---------- */
export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">‹</Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={i} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Button key={i} variant={p === page ? "primary" : "ghost"} size="sm" onClick={() => onChange(p as number)} aria-current={p === page ? "page" : undefined}>
            {p}
          </Button>
        )
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">›</Button>
    </nav>
  );
}

/* ---------- Toggle group / Segmented ---------- */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", value === o.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
