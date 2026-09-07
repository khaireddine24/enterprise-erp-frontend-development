import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import {
  useGoodsReceipts, usePurchaseOrders, usePurchaseQuotations, usePurchaseRequests,
  usePurchaseReturns, useSupplier, useSupplierInvoices, useSupplierPayments, useSuppliers,
} from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ColumnDef, ListParams } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Tabs } from "@/components/ui/primitives";
import { DetailGrid, EntityCell, PageContainer, PageHeader, StatusBadge } from "@/components/common/feedback";
import { DocDetails, FieldConfig, ResourcePage } from "@/components/common/crud";
import { formatCurrency, formatDate, formatNumber, formatPhone } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Doc = Record<string, unknown>;

function pdocColumns(): ColumnDef<Doc>[] {
  return [
    { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
    { key: "supplier", header: "Supplier", accessor: (r) => <EntityCell name={String(r.supplier)} sub={String(r.requester ?? "")} /> },
    { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
    { key: "total", header: "Total", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.total))}</span> },
    { key: "balance", header: "Balance", align: "right", accessor: (r) => formatCurrency(Number(r.balance ?? 0)) },
    { key: "warehouse", header: "Warehouse" },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
  ];
}

const pdocFields: FieldConfig[] = [
  { name: "supplier", label: "Supplier", type: "text", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "expectedDate", label: "Expected date", type: "date" },
  { name: "warehouse", label: "Warehouse", type: "select", options: [{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }] },
  { name: "requester", label: "Requester", type: "text" },
  { name: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Pending approval", value: "pending_approval" }] },
];

const P = PERMISSIONS;
const perms = { createPermission: P.PURCHASES_CREATE, updatePermission: P.PURCHASES_UPDATE, deletePermission: P.PURCHASES_DELETE };
const statusFilter = (statuses: string[]) => [{ key: "status", label: "Status", options: statuses.map((s) => ({ label: humanize(s), value: s })) }];

export function SuppliersPage() {
  useDocumentTitle("Suppliers");
  const navigate = useNavigate();
  return (
    <ResourcePage<Doc>
      title="Suppliers" description="Supplier master, balances and performance."
      breadcrumbs={[{ label: "Purchases" }, { label: "Suppliers" }]}
      listHook={(p: ListParams) => useSuppliers(p) as never}
      columns={() => [
        { key: "name", header: "Supplier", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={String(r.code)} /> },
        { key: "category", header: "Category" },
        { key: "city", header: "Location", accessor: (r) => `${r.city}, ${r.country}` },
        { key: "totalOrders", header: "Orders", align: "right", accessor: (r) => formatNumber(Number(r.totalOrders)) },
        { key: "totalPurchases", header: "Purchases", align: "right", sortable: true, accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.totalPurchases))}</span> },
        { key: "balance", header: "Balance", align: "right", accessor: (r) => formatCurrency(Number(r.balance)) },
        { key: "rating", header: "Rating", accessor: (r) => `★ ${r.rating}` },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      exportFilename="suppliers"
      createFields={[
        { name: "name", label: "Supplier name", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["Office Supplies", "IT Equipment", "Furniture", "Raw Materials", "Logistics", "Services"].map((c) => ({ label: c, value: c })) },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "city", label: "City", type: "text" },
        { name: "country", label: "Country", type: "text" },
      ]}
      {...perms}
      onRowClick={(r) => navigate(`/purchases/suppliers/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.suppliers]}
    />
  );
}

export function SupplierDetailsPage() {
  const { id } = useParams();
  const { data } = useSupplier(id);
  const [tab, setTab] = React.useState("overview");
  useDocumentTitle(data ? String(data.name) : "Supplier");
  const s = data as Doc | undefined;
  const orders = usePurchaseOrders({ page: 1, pageSize: 50, search: "", filters: { supplierId: id } });
  const invoices = useSupplierInvoices({ page: 1, pageSize: 50, search: "", filters: { supplierId: id } });

  if (!s) {
    return <PageContainer><div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        title={String(s.name)}
        description={`${s.code} · ${s.category} · ★ ${s.rating} rating`}
        breadcrumbs={[{ label: "Purchases" }, { label: "Suppliers", to: ROUTES.PURCHASES.SUPPLIERS }, { label: String(s.name) }]}
        actions={<StatusBadge status={String(s.status)} />}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Total purchases", formatCurrency(Number(s.totalPurchases))],
          ["Outstanding balance", formatCurrency(Number(s.balance))],
          ["Total orders", formatNumber(Number(s.totalOrders))],
          ["Rating", `★ ${s.rating} / 5`],
        ].map(([k, v]) => (
          <Card key={k}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-xl font-bold">{v as string}</p></CardContent></Card>
        ))}
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "overview", label: "Overview" }, { value: "orders", label: "Orders", count: orders.data?.total ?? 0 }, { value: "invoices", label: "Invoices", count: invoices.data?.total ?? 0 }, { value: "history", label: "History" }]} />
      {tab === "overview" && (
        <Card>
          <CardHeader><CardTitle>Supplier information</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid
              items={[
                { label: "Email", value: String(s.email) },
                { label: "Phone", value: formatPhone(String(s.phone)) },
                { label: "Location", value: `${s.city}, ${s.country}` },
                { label: "Category", value: String(s.category) },
                { label: "Partner since", value: formatDate(String(s.createdAt)) },
                { label: "Payment terms", value: "Net 30" },
              ]}
            />
          </CardContent>
        </Card>
      )}
      {tab === "orders" && <DocListCard title="Purchase orders" rows={(orders.data?.data ?? []) as Doc[]} />}
      {tab === "invoices" && <DocListCard title="Supplier invoices" rows={(invoices.data?.data ?? []) as Doc[]} />}
      {tab === "history" && (
        <Card>
          <CardContent className="space-y-2.5 pt-5">
            {(orders.data?.data ?? []).slice(0, 6).map((o) => (
              <div key={String(o.id)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px]">
                <span><span className="font-semibold">{String(o.number)}</span> · {formatCurrency(Number(o.total))}</span>
                <StatusBadge status={String(o.status)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

function DocListCard({ title, rows }: { title: string; rows: Doc[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Number</th><th className="py-2 pr-4">Date</th><th className="py-2 pr-4 text-right">Total</th><th className="py-2 text-right">Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={String(r.id)} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-primary">{String(r.number)}</td>
                    <td className="py-2.5 pr-4">{formatDate(String(r.date))}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold">{formatCurrency(Number(r.total))}</td>
                    <td className="py-2.5 text-right"><StatusBadge status={String(r.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PurchaseRequestsPage() {
  useDocumentTitle("Purchase Requests");
  return <ResourcePage<Doc> title="Purchase Requests" description="Internal demand intake with approval workflow." breadcrumbs={[{ label: "Purchases" }, { label: "Requests" }]} listHook={(p: ListParams) => usePurchaseRequests(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "pending_approval", "approved", "rejected"])} exportFilename="purchase-requests" createFields={pdocFields} {...perms} invalidateKeys={[QUERY_KEYS.purchaseRequests]} />;
}
export function PurchaseQuotationsPage() {
  useDocumentTitle("Purchase Quotations");
  return <ResourcePage<Doc> title="Purchase Quotations" description="Compare supplier quotes side by side." breadcrumbs={[{ label: "Purchases" }, { label: "Quotations" }]} listHook={(p: ListParams) => usePurchaseQuotations(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "sent", "accepted", "rejected"])} exportFilename="purchase-quotations" createFields={pdocFields} {...perms} invalidateKeys={[QUERY_KEYS.purchaseQuotations]} />;
}
export function PurchaseOrdersPage() {
  useDocumentTitle("Purchase Orders");
  const navigate = useNavigate();
  return <ResourcePage<Doc> title="Purchase Orders" description="Approved procurement with receipt matching." breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]} listHook={(p: ListParams) => usePurchaseOrders(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "pending_approval", "approved", "confirmed", "partially_fulfilled", "fulfilled"])} exportFilename="purchase-orders" createFields={pdocFields} {...perms} onRowClick={(r) => navigate(`/purchases/orders/${r.id}`)} invalidateKeys={[QUERY_KEYS.purchaseOrders]} />;
}
export function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const { data } = usePurchaseOrders({ page: 1, pageSize: 100 });
  useDocumentTitle("Purchase Order");
  const doc = (data?.data.find((d) => String(d.id) === id) ?? {}) as Doc;
  if (!data) return <PageContainer><div className="h-96 animate-pulse rounded-xl bg-muted" /></PageContainer>;
  return <DocDetails doc={doc} kind="Purchase Order" number={String(doc.number ?? id)} backTo={ROUTES.PURCHASES.ORDERS} backLabel="Purchase Orders" partyLabel="Supplier" party={String(doc.supplier ?? "—")} showApproval approvePermission={PERMISSIONS.PURCHASES_APPROVE} />;
}
export function GoodsReceiptsPage() {
  useDocumentTitle("Goods Receipts");
  return <ResourcePage<Doc> title="Goods Receipts" description="Inbound receiving against purchase orders." breadcrumbs={[{ label: "Purchases" }, { label: "Goods Receipts" }]} listHook={(p: ListParams) => useGoodsReceipts(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "partially_fulfilled", "fulfilled"])} exportFilename="goods-receipts" createFields={pdocFields} {...perms} invalidateKeys={[QUERY_KEYS.goodsReceipts]} />;
}
export function SupplierInvoicesPage() {
  useDocumentTitle("Supplier Invoices");
  return <ResourcePage<Doc> title="Supplier Invoices" description="3-way match: order → receipt → invoice." breadcrumbs={[{ label: "Purchases" }, { label: "Supplier Invoices" }]} listHook={(p: ListParams) => useSupplierInvoices(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "sent", "partially_paid", "paid", "overdue"])} exportFilename="supplier-invoices" createFields={pdocFields} {...perms} invalidateKeys={[QUERY_KEYS.supplierInvoices]} />;
}
export function SupplierPaymentsPage() {
  useDocumentTitle("Supplier Payments");
  return (
    <ResourcePage<Doc>
      title="Supplier Payments" description="Outgoing payments to suppliers."
      breadcrumbs={[{ label: "Purchases" }, { label: "Payments" }]}
      listHook={(p: ListParams) => useSupplierPayments(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
        { key: "customer", header: "Supplier", accessor: (r) => <EntityCell name={String(r.customer)} sub={String(r.invoiceNumber)} /> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "method", header: "Method" },
        { key: "amount", header: "Amount", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.amount))}</span> },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      exportFilename="supplier-payments"
      createFields={[
        { name: "customer", label: "Supplier", type: "text", required: true },
        { name: "invoiceNumber", label: "Invoice", type: "text", required: true },
        { name: "amount", label: "Amount", type: "currency", required: true, min: 0 },
        { name: "method", label: "Method", type: "select", required: true, options: ["Bank Transfer", "Credit Card", "Cash", "Check"].map((m) => ({ label: m, value: m })) },
        { name: "date", label: "Date", type: "date", required: true },
      ]}
      {...perms}
      invalidateKeys={[QUERY_KEYS.supplierPayments]}
    />
  );
}
export function PurchaseReturnsPage() {
  useDocumentTitle("Purchase Returns");
  return <ResourcePage<Doc> title="Purchase Returns" description="Return defective or excess goods to suppliers." breadcrumbs={[{ label: "Purchases" }, { label: "Returns" }]} listHook={(p: ListParams) => usePurchaseReturns(p) as never} columns={pdocColumns} filterDefs={statusFilter(["draft", "approved", "completed"])} exportFilename="purchase-returns" createFields={pdocFields} {...perms} invalidateKeys={[QUERY_KEYS.purchaseReturns]} />;
}
