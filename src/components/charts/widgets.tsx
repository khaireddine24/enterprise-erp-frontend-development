/* Reusable dashboard widgets + Recharts wrappers. */
import * as React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/primitives";
import { ErrorState } from "@/components/common/feedback";
import { formatCompactCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string; currency?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{currency ? formatCompactCurrency(p.value) : p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function WidgetShell({ title, subtitle, action, loading, error, onRetry, children, className }: {
  title: string; subtitle?: string; action?: React.ReactNode;
  loading?: boolean; error?: boolean; onRetry?: () => void;
  children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {onRetry && (
            <button onClick={onRetry} aria-label={`Refresh ${title}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-2 py-4"><Skeleton className="h-40 w-full" /></div>
        ) : error ? (
          <ErrorState onRetry={onRetry} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data, loading }: { data?: { month: string; revenue: number; expenses: number; profit: number }[]; loading?: boolean }) {
  return (
    <WidgetShell title="Revenue vs Expenses" subtitle="Monthly performance · 2026" loading={loading}>
      <div className="h-[280px]" role="img" aria-label="Revenue versus expenses chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <RTooltip content={<ChartTooltip currency />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#gRev)" name="Revenue" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#gExp)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

export function SalesPurchaseChart({ data, loading }: { data?: { month: string; sales: number; purchases: number }[]; loading?: boolean }) {
  return (
    <WidgetShell title="Sales vs Purchases" subtitle="Order volume by month" loading={loading}>
      <div className="h-[240px]" role="img" aria-label="Sales versus purchases chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <RTooltip content={<ChartTooltip currency />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} name="Sales" />
            <Bar dataKey="purchases" fill="#10b981" radius={[4, 4, 0, 0]} name="Purchases" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

export function CashFlowChart({ data, loading }: { data?: { month: string; inflow: number; outflow: number }[]; loading?: boolean }) {
  return (
    <WidgetShell title="Cash Flow" subtitle="Inflow vs outflow" loading={loading}>
      <div className="h-[240px]" role="img" aria-label="Cash flow chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <RTooltip content={<ChartTooltip currency />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2.5} dot={false} name="Inflow" />
            <Line type="monotone" dataKey="outflow" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Outflow" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

export function DonutChart({ title, subtitle, data, loading, currency }: {
  title: string; subtitle?: string; data?: { name: string; value: number }[]; loading?: boolean; currency?: boolean;
}) {
  return (
    <WidgetShell title={title} subtitle={subtitle} loading={loading}>
      <div className="h-[240px]" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data ?? []} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} strokeWidth={0}>
              {(data ?? []).map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip content={<ChartTooltip currency={currency} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

export function HorizontalBarWidget({ title, subtitle, data, loading }: {
  title: string; subtitle?: string; data?: { name: string; actual: number; target: number }[]; loading?: boolean;
}) {
  return (
    <WidgetShell title={title} subtitle={subtitle} loading={loading}>
      <div className="h-[260px]" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 70, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} width={110} />
            <RTooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Bar dataKey="actual" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Actual %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

export function Sparkline({ data, color = "#2563eb", id }: { data: number[]; color?: string; id: string }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TopListWidget({ title, subtitle, items, loading, renderValue }: {
  title: string; subtitle?: string; loading?: boolean;
  items?: { name: string; sub?: string }[];
  renderValue?: (index: number) => React.ReactNode;
}) {
  return (
    <WidgetShell title={title} subtitle={subtitle} loading={loading}>
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <ul className="divide-y divide-border">
          {(items ?? []).map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{item.name}</p>
                  {item.sub && <p className="truncate text-xs text-muted-foreground">{item.sub}</p>}
                </div>
              </div>
              {renderValue?.(i)}
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}
