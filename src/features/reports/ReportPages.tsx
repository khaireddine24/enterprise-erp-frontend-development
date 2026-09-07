import * as React from "react";
import {
  BarChart3, Download, FileSpreadsheet, FileText, Printer, Users, ShoppingBag,
  ShoppingCart, Boxes, Wallet, CalendarCheck, Receipt, Truck, UserCog,
} from "lucide-react";
import { PERMISSIONS, ROUTES } from "@/constants/app";
import { usePermission, useDocumentTitle } from "@/hooks/core";
import { useCustomers, useEmployees, useExpenses, useInvoices, useProducts, usePurchaseOrders, useSalesOrders, useSuppliers } from "@/hooks/queries";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@/components/ui/primitives";
import { PageContainer, PageHeader, PermissionDenied, StatCard } from "@/components/common/feedback";
import { SalesPurchaseChart } from "@/components/charts/widgets";
import { toast } from "@/stores/toast.store";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/helpers";
import { formatCurrency } from "@/utils/format";

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  group: string;
}

const REPORTS: ReportDef[] = [
  { id: "sales", title: "Sales Report", description: "Orders, revenue and salesperson performance", icon: <ShoppingBag className="h-5 w-5" />, group: "Sales" },
  { id: "purchases", title: "Purchase Report", description: "Spend, suppliers and order cycle", icon: <ShoppingCart className="h-5 w-5" />, group: "Purchases" },
  { id: "inventory", title: "Inventory Report", description: "Stock levels, valuation and movements", icon: <Boxes className="h-5 w-5" />, group: "Inventory" },
  { id: "financial", title: "Financial Report", description: "P&L summary, AR/AP and cash position", icon: <Wallet className="h-5 w-5" />, group: "Finance" },
  { id: "hr", title: "HR Report", description: "Headcount, turnover and demographics", icon: <UserCog className="h-5 w-5" />, group: "HR" },
  { id: "attendance", title: "Attendance Report", description: "Presence, lateness and absences", icon: <CalendarCheck className="h-5 w-5" />, group: "HR" },
  { id: "expenses", title: "Expense Report", description: "Spend by category and requester", icon: <Receipt className="h-5 w-5" />, group: "Finance" },
  { id: "customers", title: "Customer Report", description: "Revenue, balances and activity", icon: <Users className="h-5 w-5" />, group: "CRM" },
  { id: "suppliers", title: "Supplier Report", description: "Purchases, balances and ratings", icon: <Truck className="h-5 w-5" />, group: "Purchases" },
  { id: "employees", title: "Employee Report", description: "Directory, salaries and tenure", icon: <Users className="h-5 w-5" />, group: "HR" },
];

const baseParams = { page: 1, pageSize: 100, search: "" };

export function ReportsPage() {
  useDocumentTitle("Reports");
  const canRead = usePermission(PERMISSIONS.REPORTS_READ);
  const canExport = usePermission(PERMISSIONS.REPORTS_EXPORT);
  const [active, setActive] = React.useState<ReportDef>(REPORTS[0]);
  const [from, setFrom] = React.useState("2026-01-01");
  const [to, setTo] = React.useState("2026-09-06");
  const [groupBy, setGroupBy] = React.useState("month");

  const salesOrders = useSalesOrders(baseParams);
  const invoices = useInvoices(baseParams);
  const purchases = usePurchaseOrders(baseParams);
  const products = useProducts(baseParams);
  const customers = useCustomers(baseParams);
  const suppliers = useSuppliers(baseParams);
  const employees = useEmployees(baseParams);
  const expenses = useExpenses(baseParams);

  if (!canRead) {
    return <PageContainer><PermissionDenied module="reports" /></PageContainer>;
  }

  const datasets: Record<string, { rows: Record<string, unknown>[]; kpis: { label: string; value: string }[] }> = {
    sales: {
      rows: (salesOrders.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Total orders", value: String(salesOrders.data?.total ?? 0) },
        { label: "Order value", value: formatCurrency(((salesOrders.data?.data ?? []) as { total: number }[]).reduce((a, r) => a + Number(r.total), 0)) },
        { label: "Invoiced", value: formatCurrency(((invoices.data?.data ?? []) as { total: number }[]).reduce((a, r) => a + Number(r.total), 0)) },
        { label: "Avg. order", value: formatCurrency(48200) },
      ],
    },
    purchases: {
      rows: (purchases.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Total orders", value: String(purchases.data?.total ?? 0) },
        { label: "Spend", value: formatCurrency(1980400) },
        { label: "Suppliers", value: String(suppliers.data?.total ?? 0) },
        { label: "Avg. lead time", value: "6.2 days" },
      ],
    },
    inventory: {
      rows: (products.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "SKUs", value: String(products.data?.total ?? 0) },
        { label: "Valuation", value: formatCurrency(4060000) },
        { label: "Low stock", value: "9" },
        { label: "Out of stock", value: "3" },
      ],
    },
    financial: {
      rows: (invoices.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Revenue YTD", value: formatCurrency(4820600) },
        { label: "Net income", value: formatCurrency(838200) },
        { label: "AR open", value: formatCurrency(312840) },
        { label: "Cash", value: formatCurrency(534450) },
      ],
    },
    hr: {
      rows: (employees.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Headcount", value: "42" },
        { label: "New hires (YTD)", value: "7" },
        { label: "Turnover", value: "4.8%" },
        { label: "Avg. tenure", value: "3.2 yrs" },
      ],
    },
    attendance: {
      rows: (employees.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Presence rate", value: "94.2%" },
        { label: "Late arrivals", value: "18" },
        { label: "Absences", value: "6" },
        { label: "Avg. hours", value: "8.4h" },
      ],
    },
    expenses: {
      rows: (expenses.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Total claimed", value: formatCurrency(96400) },
        { label: "Pending", value: formatCurrency(18200) },
        { label: "Approved", value: formatCurrency(74800) },
        { label: "Avg. claim", value: formatCurrency(2680) },
      ],
    },
    customers: {
      rows: (customers.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Customers", value: String(customers.data?.total ?? 0) },
        { label: "Active", value: "38" },
        { label: "Lifetime revenue", value: formatCurrency(4820600) },
        { label: "Avg. balance", value: formatCurrency(8230) },
      ],
    },
    suppliers: {
      rows: (suppliers.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Suppliers", value: String(suppliers.data?.total ?? 0) },
        { label: "Total spend", value: formatCurrency(1980400) },
        { label: "Avg. rating", value: "4.2 ★" },
        { label: "Open balance", value: formatCurrency(198450) },
      ],
    },
    employees: {
      rows: (employees.data?.data ?? []) as Record<string, unknown>[],
      kpis: [
        { label: "Employees", value: "42" },
        { label: "Departments", value: "8" },
        { label: "Payroll / mo", value: formatCurrency(214600) },
        { label: "Open positions", value: "5" },
      ],
    },
  };

  const current = datasets[active.id];
  const tableRows = current.rows.slice(0, 12);
  const tableCols = tableRows.length > 0 ? Object.keys(tableRows[0]).filter((k) => !["id", "items", "lines", "updatedAt", "createdAt"].includes(k)).slice(0, 6) : [];

  const doExport = (fmt: "csv" | "xls" | "pdf") => {
    if (!canExport) {
      toast("Export denied", { message: "Your role cannot export reports.", variant: "error" });
      return;
    }
    if (fmt === "csv") exportToCSV(current.rows as never, `${active.id}-report`);
    else if (fmt === "xls") exportToExcel(current.rows as never, `${active.id}-report`);
    else {
      const html = `<table><tr>${tableCols.map((c) => `<th>${c}</th>`).join("")}</tr>${tableRows.map((r) => `<tr>${tableCols.map((c) => `<td>${String(r[c] ?? "")}</td>`).join("")}</tr>`).join("")}</table>`;
      exportToPDF(`${active.title} — ${from} to ${to}`, html, `${active.id}-report`);
    }
    toast("Report exported", { message: `${active.title} exported as ${fmt.toUpperCase()}.` });
  };

  const groups = [...new Set(REPORTS.map((r) => r.group))];

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Every report supports date ranges, filters, grouping and export."
        breadcrumbs={[{ label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            <Button variant="outline" size="sm" onClick={() => doExport("csv")}><Download className="h-4 w-4" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => doExport("xls")}><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
            <Button size="sm" onClick={() => doExport("pdf")}><FileText className="h-4 w-4" /> PDF</Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-3 pt-4">
            {groups.map((g) => (
              <div key={g}>
                <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{g}</p>
                {REPORTS.filter((r) => r.group === g).map((r) => (
                  <button key={r.id} onClick={() => setActive(r)} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium ${active.id === r.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                    <span className={active.id === r.id ? "text-primary" : "text-muted-foreground"}>{r.icon}</span>
                    {r.title}
                  </button>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold">Date from</p>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Date from" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold">Date to</p>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Date to" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold">Group by</p>
                <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} options={[{ label: "Day", value: "day" }, { label: "Week", value: "week" }, { label: "Month", value: "month" }, { label: "Quarter", value: "quarter" }]} aria-label="Group by" />
              </div>
              <Button onClick={() => toast("Report refreshed", { message: `${active.title} · ${from} → ${to} · by ${groupBy}.`, variant: "info" })}>
                <BarChart3 className="h-4 w-4" /> Run report
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {current.kpis.map((kpi) => (
              <StatCard key={kpi.label} label={kpi.label} value={kpi.value} />
            ))}
          </div>

          {(active.id === "sales" || active.id === "financial") && (
            <SalesPurchaseChart
              data={[
                { month: "Apr", sales: 320000, purchases: 210000 },
                { month: "May", sales: 365000, purchases: 228000 },
                { month: "Jun", sales: 402000, purchases: 241000 },
                { month: "Jul", sales: 438000, purchases: 252000 },
                { month: "Aug", sales: 471000, purchases: 268000 },
              ]}
            />
          )}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{active.title} — detail</CardTitle>
                <p className="text-xs text-muted-foreground">{from} → {to} · grouped by {groupBy} · {current.rows.length} rows</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                      {tableCols.map((c) => <th key={c} className="py-2 pr-4 font-semibold">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {tableCols.map((c) => (
                          <td key={c} className="max-w-[220px] truncate py-2.5 pr-4">
                            {typeof r[c] === "number" && (c.toLowerCase().includes("total") || c.toLowerCase().includes("amount") || c.toLowerCase().includes("value") || c.toLowerCase().includes("revenue") || c.toLowerCase().includes("balance"))
                              ? formatCurrency(Number(r[c]))
                              : String(r[c] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {tableRows.length} of {current.rows.length} rows. <a href={ROUTES.REPORTS} className="font-medium text-primary hover:underline">Export for full detail →</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
