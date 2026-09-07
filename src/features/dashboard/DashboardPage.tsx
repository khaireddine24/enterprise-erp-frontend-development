import * as React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Banknote, CalendarClock, CircleDollarSign, Package,
  Receipt, Settings2, ShoppingBag, ShoppingCart, TrendingDown, TrendingUp, Users, Wallet,
} from "lucide-react";
import { ROUTES } from "@/constants/app";
import { useDocumentTitle, useLocalStorage } from "@/hooks/core";
import {
  useCashFlowSeriesHook, useDashboardKpis, useDepartmentPerformance, useInventoryByCategory,
  useLowStock, useRecentActivities, useRecentInvoices, useRevenueSeries,
  useSalesPurchaseSeries, useTopCustomers, useTopProducts,
} from "@/hooks/queries";
import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Dropdown, Segmented } from "@/components/ui/primitives";
import { EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { CashFlowChart, DonutChart, HorizontalBarWidget, RevenueChart, SalesPurchaseChart, TopListWidget } from "@/components/charts/widgets";
import { formatCurrency, formatDate, formatNumber, formatRelative } from "@/utils/format";

const WIDGETS = [
  { id: "kpis", label: "KPI cards" },
  { id: "revenue", label: "Revenue chart" },
  { id: "sales", label: "Sales vs purchases" },
  { id: "cashflow", label: "Cash flow" },
  { id: "inventory", label: "Inventory by category" },
  { id: "dept", label: "Department performance" },
  { id: "topCustomers", label: "Top customers" },
  { id: "topProducts", label: "Top products" },
  { id: "recent", label: "Recent invoices" },
  { id: "activity", label: "Activity feed" },
  { id: "lowstock", label: "Low stock alerts" },
] as const;

export default function DashboardPage() {
  useDocumentTitle("Executive Dashboard");
  const [range, setRange] = React.useState("month");
  const [visible, setVisible] = useLocalStorage<string[]>("nexora.dashboard.widgets", WIDGETS.map((w) => w.id));
  const show = (id: string) => visible.includes(id);
  const toggle = (id: string) => setVisible((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const kpis = useDashboardKpis();
  const revenue = useRevenueSeries();
  const salesPurchases = useSalesPurchaseSeries();
  const cashflow = useCashFlowSeriesHook();
  const invCat = useInventoryByCategory();
  const deptPerf = useDepartmentPerformance();
  const topCustomers = useTopCustomers();
  const topProducts = useTopProducts();
  const activities = useRecentActivities();
  const recentInvoices = useRecentInvoices();
  const lowStock = useLowStock();
  const k = kpis.data;

  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Business performance at a glance · Updated just now"
        actions={
          <>
            <Segmented
              value={range}
              onChange={setRange}
              options={[
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "quarter", label: "Quarter" },
                { value: "year", label: "Year" },
              ]}
            />
            <Dropdown
              trigger={<Button variant="outline" size="sm"><Settings2 className="h-4 w-4" /> Widgets</Button>}
              items={WIDGETS.map((w) => ({ label: `${visible.includes(w.id) ? "✓ " : ""}${w.label}`, onClick: () => toggle(w.id) }))}
            />
          </>
        }
      />

      {show("kpis") && (
        <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Revenue" value={formatCurrency(k?.revenue ?? 0)} delta={k?.revenueDelta} deltaLabel="vs last period" icon={<CircleDollarSign className="h-5 w-5" />} tone="info" loading={kpis.isLoading} />
          <StatCard label="Total Expenses" value={formatCurrency(k?.expenses ?? 0)} delta={k?.expensesDelta} deltaLabel="vs last period" icon={<TrendingDown className="h-5 w-5" />} tone="danger" loading={kpis.isLoading} />
          <StatCard label="Net Profit" value={formatCurrency(k?.profit ?? 0)} delta={k?.profitDelta} deltaLabel="vs last period" icon={<TrendingUp className="h-5 w-5" />} tone="success" loading={kpis.isLoading} />
          <StatCard label="Cash Flow" value={formatCurrency(k?.cashFlow ?? 0)} delta={k?.cashFlowDelta} deltaLabel="vs last period" icon={<Wallet className="h-5 w-5" />} tone="warning" loading={kpis.isLoading} />
          <StatCard label="Sales" value={formatCurrency(k?.sales ?? 0)} delta={k?.salesDelta} deltaLabel="vs last period" icon={<ShoppingBag className="h-5 w-5" />} tone="info" loading={kpis.isLoading} />
          <StatCard label="Purchases" value={formatCurrency(k?.purchases ?? 0)} delta={k?.purchasesDelta} deltaLabel="vs last period" icon={<ShoppingCart className="h-5 w-5" />} tone="default" loading={kpis.isLoading} />
          <StatCard label="Outstanding Invoices" value={formatCurrency(k?.outstandingInvoices ?? 0)} icon={<Receipt className="h-5 w-5" />} tone="warning" loading={kpis.isLoading} />
          <StatCard label="Inventory Value" value={formatCurrency(k?.inventoryValue ?? 0)} icon={<Package className="h-5 w-5" />} tone="success" loading={kpis.isLoading} />
        </section>
      )}

      {/* Alert strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Attention items">
        {[
          { icon: <AlertTriangle className="h-4 w-4" />, tone: "text-red-600 dark:text-red-400 bg-red-500/10", label: "Overdue invoices", value: `${k?.overdueCount ?? 0} · ${formatCurrency(k?.overdueInvoices ?? 0)}`, to: ROUTES.SALES.INVOICES },
          { icon: <Package className="h-4 w-4" />, tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10", label: "Low-stock products", value: `${k?.lowStock ?? 0} need reorder`, to: ROUTES.INVENTORY.PRODUCTS },
          { icon: <CalendarClock className="h-4 w-4" />, tone: "text-sky-600 dark:text-sky-400 bg-sky-500/10", label: "Pending leave requests", value: `${k?.leaveRequests ?? 0} awaiting HR`, to: ROUTES.HR.LEAVES },
          { icon: <Banknote className="h-4 w-4" />, tone: "text-violet-600 dark:text-violet-400 bg-violet-500/10", label: "Pending approvals", value: `${k?.pendingApprovals ?? 0} need decision`, to: ROUTES.APPROVALS },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <span className={`rounded-lg p-2.5 ${a.tone}`}>{a.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">{a.label}</span>
              <span className="block truncate text-sm font-bold">{a.value}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </section>

      {show("revenue") && <RevenueChart data={revenue.data} loading={revenue.isLoading} />}

      <section className="grid gap-5 xl:grid-cols-2">
        {show("sales") && <SalesPurchaseChart data={salesPurchases.data} loading={salesPurchases.isLoading} />}
        {show("cashflow") && <CashFlowChart data={cashflow.data} loading={cashflow.isLoading} />}
        {show("inventory") && <DonutChart title="Inventory Value by Category" subtitle="Stock valuation distribution" data={invCat.data} loading={invCat.isLoading} currency />}
        {show("dept") && <HorizontalBarWidget title="Department Performance" subtitle="Actual vs target (%)" data={deptPerf.data} loading={deptPerf.isLoading} />}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {show("topCustomers") && (
          <TopListWidget
            title="Top Customers" subtitle="By lifetime revenue" loading={topCustomers.isLoading}
            items={topCustomers.data?.map((c) => ({ name: c.name, sub: `${c.orders} orders` }))}
            renderValue={(i) => <span className="text-[13px] font-bold">{formatCurrency(topCustomers.data?.[i]?.revenue ?? 0)}</span>}
          />
        )}
        {show("topProducts") && (
          <TopListWidget
            title="Top Products" subtitle="By revenue this year" loading={topProducts.isLoading}
            items={topProducts.data?.map((p) => ({ name: p.name, sub: `${formatNumber(p.qty)} units sold` }))}
            renderValue={(i) => <span className="text-[13px] font-bold">{formatCurrency(topProducts.data?.[i]?.revenue ?? 0)}</span>}
          />
        )}
        {show("activity") && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <Link to={ROUTES.AUDIT_LOGS} className="text-xs font-medium text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-5 ml-1">
                {(activities.data ?? []).slice(0, 6).map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                    <p className="text-[13px]"><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{a.action}</span></p>
                    <p className="text-[11px] text-muted-foreground">{a.entity} · {formatRelative(a.time)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {show("recent") && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <p className="text-xs text-muted-foreground">Latest billing activity</p>
              </div>
              <Link to={ROUTES.SALES.INVOICES} className="text-xs font-medium text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {(recentInvoices.data ?? []).map((inv) => (
                  <li key={inv.id}>
                    <Link to={`/sales/invoices/${inv.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded-lg">
                      <EntityCell name={inv.customer} sub={`${inv.number} · ${formatDate(inv.date)}`} />
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-bold">{formatCurrency(inv.total)}</span>
                        <StatusBadge status={inv.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {show("lowstock") && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <p className="text-xs text-muted-foreground">Products below reorder level</p>
              </div>
              <Link to={ROUTES.INVENTORY.PRODUCTS} className="text-xs font-medium text-primary hover:underline">Manage</Link>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {(lowStock.data ?? []).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <EntityCell name={p.name} sub={`${p.sku} · ${p.warehouse}`} />
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-bold">{p.stock} left</span>
                      <StatusBadge status={p.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Workforce strip */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Workforce">
        {[
          { icon: <Users className="h-5 w-5" />, label: "Total employees", value: String(k?.employees ?? 0), to: ROUTES.HR.EMPLOYEES },
          { icon: <CalendarClock className="h-5 w-5" />, label: "Attendance rate", value: `${k?.attendanceRate ?? 0}%`, to: ROUTES.HR.ATTENDANCE },
          { icon: <Settings2 className="h-5 w-5" />, label: "Open tasks assigned", value: "18", to: ROUTES.PROJECTS.TASKS },
        ].map((w) => (
          <Link key={w.label} to={w.to} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/50">
            <span className="rounded-lg bg-muted p-2.5 text-muted-foreground">{w.icon}</span>
            <span><span className="block text-xs text-muted-foreground">{w.label}</span><span className="block text-lg font-bold">{w.value}</span></span>
          </Link>
        ))}
      </section>

      <label className="hidden"><Checkbox checked={false} onChange={() => undefined} aria-hidden tabIndex={-1} /></label>
    </PageContainer>
  );
}
