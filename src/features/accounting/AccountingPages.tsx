import * as React from "react";
import { Link } from "react-router-dom";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import { useAccounts, useCashFlowSeriesHook, useExpenses, useInvoices, useJournal, useSupplierInvoices } from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage } from "@/components/common/crud";
import { CashFlowChart, DonutChart } from "@/components/charts/widgets";
import { exportToCSV } from "@/utils/helpers";
import { formatCurrency, formatDate } from "@/utils/format";
import { groupBy, sumBy } from "@/utils/helpers";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;
const P = PERMISSIONS;

export function AccountingOverviewPage() {
  useDocumentTitle("Accounting Overview");
  const ar = useInvoices({ page: 1, pageSize: 100 });
  const ap = useSupplierInvoices({ page: 1, pageSize: 100 });
  const cashflow = useCashFlowSeriesHook();

  const arTotal = (ar.data?.data ?? []).reduce((a, r) => a + Number(r.balance ?? 0), 0);
  const apTotal = (ap.data?.data ?? []).reduce((a, r) => a + Number(r.balance ?? 0), 0);
  const overdue = (ar.data?.data ?? []).filter((r) => r.status === "overdue").reduce((a, r) => a + Number(r.balance ?? 0), 0);

  return (
    <PageContainer>
      <PageHeader title="Accounting" description="Financial health, receivables, payables and statements." breadcrumbs={[{ label: "Accounting" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts Receivable" value={formatCurrency(arTotal)} loading={ar.isLoading} tone="info" />
        <StatCard label="Accounts Payable" value={formatCurrency(apTotal)} loading={ap.isLoading} tone="warning" />
        <StatCard label="Overdue AR" value={formatCurrency(overdue)} loading={ar.isLoading} tone="danger" />
        <StatCard label="Net Position (AR − AP)" value={formatCurrency(arTotal - apTotal)} loading={ar.isLoading} tone="success" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <CashFlowChart data={cashflow.data} loading={cashflow.isLoading} />
        <DonutChart title="Expense Mix" subtitle="This quarter" loading={false} currency
          data={[{ name: "Salaries", value: 986000 }, { name: "COGS", value: 2740800 }, { name: "Rent", value: 144000 }, { name: "Marketing", value: 96400 }, { name: "Other", value: 188400 }]} />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { t: "Profit & Loss", d: "Revenue, COGS and net income", to: ROUTES.ACCOUNTING.PROFIT_LOSS },
          { t: "Balance Sheet", d: "Assets, liabilities and equity", to: ROUTES.ACCOUNTING.BALANCE_SHEET },
          { t: "Cash Flow", d: "Operating, investing, financing", to: ROUTES.ACCOUNTING.CASH_FLOW },
        ].map((s) => (
          <Link key={s.t} to={s.to} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
            <p className="text-sm font-bold">{s.t}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.d}</p>
            <p className="mt-3 text-[13px] font-semibold text-primary">Open statement →</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

export function ChartOfAccountsPage() {
  useDocumentTitle("Chart of Accounts");
  const q = useAccounts({ page: 1, pageSize: 100 });
  const groups = React.useMemo(() => groupBy((q.data?.data ?? []) as Row[], (r) => String(r.type)), [q.data]);
  const order = ["asset", "liability", "equity", "revenue", "expense"];
  return (
    <PageContainer>
      <PageHeader title="Chart of Accounts" description="Standard double-entry account structure." breadcrumbs={[{ label: "Accounting" }, { label: "Chart of Accounts" }]} actions={<Button variant="outline" size="sm" onClick={() => exportToCSV(((q.data?.data ?? []) as Record<string, unknown>[]), "chart-of-accounts")}>Export</Button>} />
      <div className="grid gap-5 xl:grid-cols-2">
        {order.map((type) => (
          <Card key={type}>
            <CardHeader><CardTitle>{humanize(type)}s</CardTitle><span className="text-xs font-bold text-muted-foreground">{formatCurrency(sumBy(groups[type] ?? [], (r) => Math.abs(Number(r.balance ?? 0))))}</span></CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {(groups[type] ?? []).map((a) => (
                  <li key={String(a.id)} className="flex items-center justify-between py-2 text-[13px]">
                    <span><span className="mr-2 font-mono text-xs text-muted-foreground">{String(a.code)}</span><span className="font-medium">{String(a.name)}</span></span>
                    <span className="font-bold">{formatCurrency(Number(a.balance))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

const journalFields: FieldConfig[] = [
  { name: "description", label: "Description", type: "text", required: true, fullWidth: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "reference", label: "Reference", type: "text" },
  { name: "total", label: "Amount", type: "currency", required: true, min: 0 },
  { name: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Posted", value: "posted" }] },
];

export function JournalPage() {
  useDocumentTitle("Journal Entries");
  return (
    <ResourcePage<Row>
      title="Journal Entries" description="Manual journals with balanced debits and credits."
      breadcrumbs={[{ label: "Accounting" }, { label: "Journal" }]}
      listHook={(p: ListParams) => useJournal(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "description", header: "Description", accessor: (r) => <EntityCell name={String(r.description)} sub={String(r.reference)} /> },
        { key: "total", header: "Total", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.total))}</span> },
        { key: "createdBy", header: "Created by" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status === "posted" ? "completed" : "draft"} /> },
      ]}
      exportFilename="journal-entries"
      createFields={journalFields}
      createPermission={P.ACCOUNTING_CREATE} updatePermission={P.ACCOUNTING_UPDATE}
      invalidateKeys={[QUERY_KEYS.journal]}
    />
  );
}

function AgingTable({ rows, label }: { rows: Row[]; label: string }) {
  const buckets = [
    { label: "Current", test: (_r: Row, d: number) => d <= 0 },
    { label: "1–30 days", test: (_r: Row, d: number) => d > 0 && d <= 30 },
    { label: "31–60 days", test: (_r: Row, d: number) => d > 30 && d <= 60 },
    { label: "60+ days", test: (_r: Row, d: number) => d > 60 },
  ];
  const withAge = rows.map((r) => {
    const due = new Date(String(r.dueDate ?? r.date)).getTime();
    const days = Math.floor((Date.now() - due) / 86400000);
    return { r, days };
  });
  return (
    <Card>
      <CardHeader><CardTitle>{label} aging</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Bucket</th><th className="py-2 pr-4 text-right">Count</th><th className="py-2 text-right">Amount</th></tr></thead>
            <tbody>
              {buckets.map((b) => {
                const inBucket = withAge.filter((x) => b.test(x.r, x.days));
                return (
                  <tr key={b.label} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{b.label}</td>
                    <td className="py-2.5 pr-4 text-right">{inBucket.length}</td>
                    <td className="py-2.5 text-right font-bold">{formatCurrency(inBucket.reduce((a, x) => a + Number(x.r.balance ?? 0), 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReceivablesPage() {
  useDocumentTitle("Accounts Receivable");
  const q = useInvoices({ page: 1, pageSize: 100, search: "", filters: {} });
  const open = ((q.data?.data ?? []) as Row[]).filter((r) => Number(r.balance) > 0);
  return (
    <PageContainer>
      <PageHeader title="Accounts Receivable" description="Customer balances and collection aging." breadcrumbs={[{ label: "Accounting" }, { label: "Receivables" }]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open balance" value={formatCurrency(open.reduce((a, r) => a + Number(r.balance), 0))} loading={q.isLoading} tone="info" />
        <StatCard label="Overdue" value={formatCurrency(open.filter((r) => r.status === "overdue").reduce((a, r) => a + Number(r.balance), 0))} loading={q.isLoading} tone="danger" />
        <StatCard label="Open invoices" value={String(open.length)} loading={q.isLoading} />
      </div>
      <AgingTable rows={open} label="Receivable" />
    </PageContainer>
  );
}

export function PayablesPage() {
  useDocumentTitle("Accounts Payable");
  const q = useSupplierInvoices({ page: 1, pageSize: 100 });
  const open = ((q.data?.data ?? []) as Row[]).filter((r) => Number(r.balance) > 0);
  return (
    <PageContainer>
      <PageHeader title="Accounts Payable" description="Supplier balances and payment aging." breadcrumbs={[{ label: "Accounting" }, { label: "Payables" }]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open balance" value={formatCurrency(open.reduce((a, r) => a + Number(r.balance), 0))} loading={q.isLoading} tone="warning" />
        <StatCard label="Overdue" value={formatCurrency(open.filter((r) => r.status === "overdue").reduce((a, r) => a + Number(r.balance), 0))} loading={q.isLoading} tone="danger" />
        <StatCard label="Open bills" value={String(open.length)} loading={q.isLoading} />
      </div>
      <AgingTable rows={open} label="Payable" />
    </PageContainer>
  );
}

export function ExpensesPage() {
  useDocumentTitle("Expenses");
  return (
    <ResourcePage<Row>
      title="Expenses" description="Employee expenses with approval workflow."
      breadcrumbs={[{ label: "Accounting" }, { label: "Expenses" }]}
      listHook={(p: ListParams) => useExpenses(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "category", header: "Category", accessor: (r) => <EntityCell name={String(r.category)} sub={String(r.vendor)} /> },
        { key: "requester", header: "Requester" },
        { key: "total", header: "Total", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.total))}</span> },
        { key: "paymentMethod", header: "Method" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status) === "paid" ? "paid" : String(r.status) === "pending_approval" ? "pending_approval" : String(r.status)} /> },
      ]}
      filterDefs={[{ key: "status", label: "Status", options: ["draft", "pending_approval", "approved", "rejected", "paid"].map((s) => ({ label: humanize(s), value: s })) }]}
      exportFilename="expenses"
      createFields={[
        { name: "category", label: "Category", type: "select", required: true, options: ["Travel", "Meals", "Office Supplies", "Software", "Fuel", "Accommodation", "Training", "Marketing"].map((c) => ({ label: c, value: c })) },
        { name: "vendor", label: "Vendor", type: "text", required: true },
        { name: "amount", label: "Amount", type: "currency", required: true, min: 0 },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "paymentMethod", label: "Payment method", type: "select", options: ["Bank Transfer", "Credit Card", "Cash"].map((m) => ({ label: m, value: m })) },
        { name: "requester", label: "Requester", type: "text" },
      ]}
      createPermission={P.EXPENSES_CREATE}
      invalidateKeys={[QUERY_KEYS.expenses]}
    />
  );
}

export function TaxesPage() {
  useDocumentTitle("Tax Management");
  const rates = [
    { name: "Standard VAT", code: "VAT-15", rate: "15%", base: 2840000, tax: 426000, status: "active" },
    { name: "Reduced VAT", code: "VAT-05", rate: "5%", base: 420000, tax: 21000, status: "active" },
    { name: "Zero-rated", code: "VAT-00", rate: "0%", base: 310000, tax: 0, status: "active" },
    { name: "Withholding Tax", code: "WHT-05", rate: "5%", base: 180000, tax: 9000, status: "active" },
    { name: "Exempt", code: "EXEMPT", rate: "—", base: 96000, tax: 0, status: "inactive" },
  ];
  return (
    <PageContainer>
      <PageHeader title="Taxes" description="Tax rates, collected tax and filings." breadcrumbs={[{ label: "Accounting" }, { label: "Taxes" }]} actions={<Button size="sm">New tax rate</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tax collected (YTD)" value={formatCurrency(456000)} tone="info" />
        <StatCard label="Tax payable" value={formatCurrency(67800)} tone="warning" />
        <StatCard label="Next filing" value="Oct 15, 2026" />
      </div>
      <Card>
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Tax</th><th className="py-2 pr-4">Code</th><th className="py-2 pr-4">Rate</th><th className="py-2 pr-4 text-right">Taxable base</th><th className="py-2 pr-4 text-right">Tax amount</th><th className="py-2 text-right">Status</th></tr></thead>
              <tbody>
                {rates.map((t) => (
                  <tr key={t.code} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs">{t.code}</td>
                    <td className="py-2.5 pr-4">{t.rate}</td>
                    <td className="py-2.5 pr-4 text-right">{formatCurrency(t.base)}</td>
                    <td className="py-2.5 pr-4 text-right font-bold">{formatCurrency(t.tax)}</td>
                    <td className="py-2.5 text-right"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function StatementShell({ title, rows, totalLabel, total, exportName }: {
  title: string; rows: { section?: string; label: string; value: number; bold?: boolean; indent?: boolean }[];
  totalLabel: string; total: number; exportName: string;
}) {
  return (
    <PageContainer>
      <PageHeader title={title} description="Fiscal year 2026 · Jan 1 – Aug 31 · Accrual basis" breadcrumbs={[{ label: "Accounting" }, { label: title }]} actions={<Button variant="outline" size="sm" onClick={() => exportToCSV(rows.map((r) => ({ Account: r.label, Amount: r.value })), exportName)}>Export</Button>} />
      <Card>
        <CardContent className="pt-5">
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-sm font-bold">Nexora Industries Inc.</p>
            <p className="text-center text-xs text-muted-foreground">{title} · FY 2026 (YTD)</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((r, i) => (
                    <React.Fragment key={i}>
                      {r.section && (
                        <tr><td colSpan={2} className="pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground first:pt-0">{r.section}</td></tr>
                      )}
                      <tr className="border-b border-border/60 last:border-0">
                        <td className={`py-2 pr-4 ${r.indent ? "pl-5 text-muted-foreground" : ""} ${r.bold ? "font-bold" : ""}`}>{r.label}</td>
                        <td className={`py-2 text-right tabular-nums ${r.bold ? "font-bold" : ""}`}>{formatCurrency(r.value)}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                  <tr className="border-t-2 border-foreground/20">
                    <td className="py-3 pr-4 text-base font-bold">{totalLabel}</td>
                    <td className="py-3 text-right text-base font-bold">{formatCurrency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export function ProfitLossPage() {
  useDocumentTitle("Profit & Loss");
  return (
    <StatementShell
      title="Profit & Loss" exportName="profit-loss" totalLabel="Net Income" total={838200}
      rows={[
        { section: "Revenue", label: "Sales revenue", value: 4820600 },
        { label: "Service revenue", value: 864300 },
        { label: "Other income", value: 42500 },
        { label: "Total revenue", value: 5727400, bold: true },
        { section: "Cost of sales", label: "Cost of goods sold", value: 2740800 },
        { label: "Gross profit", value: 2986600, bold: true },
        { section: "Operating expenses", label: "Salaries & wages", value: 986000, indent: true },
        { label: "Rent", value: 144000, indent: true },
        { label: "Utilities", value: 38200, indent: true },
        { label: "Marketing", value: 96400, indent: true },
        { label: "Depreciation", value: 48200, indent: true },
        { label: "Office supplies", value: 21800, indent: true },
        { label: "Travel", value: 56400, indent: true },
        { label: "Total operating expenses", value: 1391000, bold: true },
        { section: "Result", label: "Operating income", value: 1595600, bold: true },
        { label: "Tax provision (est.)", value: 757400 },
      ]}
    />
  );
}

export function BalanceSheetPage() {
  useDocumentTitle("Balance Sheet");
  return (
    <StatementShell
      title="Balance Sheet" exportName="balance-sheet" totalLabel="Total Liabilities & Equity" total={5949750}
      rows={[
        { section: "Assets", label: "Cash on hand", value: 48250, indent: true },
        { label: "Bank — operating", value: 486200, indent: true },
        { label: "Accounts receivable", value: 312840, indent: true },
        { label: "Inventory", value: 4060000, indent: true },
        { label: "Prepaid expenses", value: 28400, indent: true },
        { label: "Equipment (net)", value: 676000, indent: true },
        { label: "Total assets", value: 5611690, bold: true },
        { section: "Liabilities", label: "Accounts payable", value: 198450, indent: true },
        { label: "Accrued expenses", value: 42300, indent: true },
        { label: "Tax payable", value: 67800, indent: true },
        { label: "Short-term loan", value: 150000, indent: true },
        { label: "Total liabilities", value: 458550, bold: true },
        { section: "Equity", label: "Share capital", value: 2000000, indent: true },
        { label: "Retained earnings", value: 1246800, indent: true },
        { label: "Current year earnings", value: 838200, indent: true },
        { label: "Total equity", value: 4085000, bold: true },
      ]}
    />
  );
}

export function CashFlowStatementPage() {
  useDocumentTitle("Cash Flow Statement");
  return (
    <StatementShell
      title="Cash Flow Statement" exportName="cash-flow" totalLabel="Net Change in Cash" total={214600}
      rows={[
        { section: "Operating activities", label: "Net income", value: 838200 },
        { label: "Depreciation", value: 48200, indent: true },
        { label: "Change in receivables", value: -64200, indent: true },
        { label: "Change in inventory", value: -184000, indent: true },
        { label: "Change in payables", value: 96400, indent: true },
        { label: "Cash from operations", value: 734600, bold: true },
        { section: "Investing activities", label: "Equipment purchases", value: -320000, indent: true },
        { label: "Cash from investing", value: -320000, bold: true },
        { section: "Financing activities", label: "Loan repayment", value: -200000, indent: true },
        { label: "Cash from financing", value: -200000, bold: true },
      ]}
    />
  );
}
