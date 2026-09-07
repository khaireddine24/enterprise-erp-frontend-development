import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import {
  useCreditNotes, useDeliveries, useInvoices, usePayments,
  useQuotations, useSalesOrders, useSalesReturns,
} from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ColumnDef, ListParams } from "@/types";
import { Button } from "@/components/ui/primitives";
import { EntityCell, PageContainer, StatusBadge } from "@/components/common/feedback";
import { DocDetails, FieldConfig, ResourcePage } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatCurrency, formatDate } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Doc = Record<string, unknown>;

function docColumns(statuses: string[]): ColumnDef<Doc>[] {
  void statuses;
  return [
    { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
    { key: "customer", header: "Customer", accessor: (r) => <EntityCell name={String(r.customer)} sub={String(r.salesperson ?? "")} /> },
    { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
    { key: "total", header: "Total", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.total))}</span> },
    { key: "balance", header: "Balance", align: "right", accessor: (r) => formatCurrency(Number(r.balance ?? 0)) },
    { key: "warehouse", header: "Warehouse" },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
  ];
}

const docFields: FieldConfig[] = [
  { name: "customer", label: "Customer", type: "text", required: true, placeholder: "Select customer" },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "dueDate", label: "Due date", type: "date" },
  { name: "warehouse", label: "Warehouse", type: "select", options: [{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }] },
  { name: "salesperson", label: "Salesperson", type: "text" },
  { name: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Sent", value: "sent" }] },
  { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
];

const P = PERMISSIONS;
const perms = { createPermission: P.SALES_CREATE, updatePermission: P.SALES_UPDATE, deletePermission: P.SALES_DELETE };

function statusFilter(statuses: string[]) {
  return [{ key: "status", label: "Status", options: statuses.map((s) => ({ label: humanize(s), value: s })) }];
}

export function QuotationsPage() {
  useDocumentTitle("Quotations");
  const navigate = useNavigate();
  return (
    <ResourcePage<Doc>
      title="Quotations" description="Create quotes and convert them to orders in one click."
      breadcrumbs={[{ label: "Sales" }, { label: "Quotations" }]}
      listHook={(p: ListParams) => useQuotations(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "sent", "accepted", "rejected", "expired", "converted"])}
      exportFilename="quotations" createFields={docFields} {...perms}
      onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)}
      extraActions={<Button variant="outline" size="sm" onClick={() => toast("Quotation converted", { message: "QT draft converted to sales order SO-2026-2240.", variant: "info" })}><ArrowRight className="h-4 w-4" /> Convert to order</Button>}
      invalidateKeys={[QUERY_KEYS.quotations]}
    />
  );
}

export function SalesOrdersPage() {
  useDocumentTitle("Sales Orders");
  const navigate = useNavigate();
  return (
    <ResourcePage<Doc>
      title="Sales Orders" description="Confirmed orders with fulfillment tracking and approvals."
      breadcrumbs={[{ label: "Sales" }, { label: "Orders" }]}
      listHook={(p: ListParams) => useSalesOrders(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "pending_approval", "approved", "confirmed", "in_progress", "partially_fulfilled", "fulfilled", "delivered"])}
      exportFilename="sales-orders" createFields={docFields} {...perms}
      onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.salesOrders]}
    />
  );
}

export function DeliveriesPage() {
  useDocumentTitle("Delivery Orders");
  return (
    <ResourcePage<Doc>
      title="Delivery Orders" description="Shipments, packing and proof of delivery."
      breadcrumbs={[{ label: "Sales" }, { label: "Deliveries" }]}
      listHook={(p: ListParams) => useDeliveries(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "in_progress", "partially_fulfilled", "delivered"])}
      exportFilename="deliveries" createFields={docFields} {...perms}
      invalidateKeys={[QUERY_KEYS.deliveries]}
    />
  );
}

export function InvoicesPage() {
  useDocumentTitle("Sales Invoices");
  const navigate = useNavigate();
  return (
    <ResourcePage<Doc>
      title="Invoices" description="Billing, payment tracking and dunning."
      breadcrumbs={[{ label: "Sales" }, { label: "Invoices" }]}
      listHook={(p: ListParams) => useInvoices(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "sent", "viewed", "partially_paid", "paid", "overdue", "cancelled"])}
      exportFilename="invoices" createFields={docFields} {...perms}
      onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.invoices]}
    />
  );
}

export function InvoiceDetailsPage() {
  const { id } = useParams();
  const invoices = useInvoices({ page: 1, pageSize: 100 });
  const quotations = useQuotations({ page: 1, pageSize: 100 });
  const orders = useSalesOrders({ page: 1, pageSize: 100 });
  const deliveries = useDeliveries({ page: 1, pageSize: 100 });
  const creditNotes = useCreditNotes({ page: 1, pageSize: 100 });
  const all = [
    ...((invoices.data?.data ?? []) as Doc[]),
    ...((quotations.data?.data ?? []) as Doc[]),
    ...((orders.data?.data ?? []) as Doc[]),
    ...((deliveries.data?.data ?? []) as Doc[]),
    ...((creditNotes.data?.data ?? []) as Doc[]),
  ];
  const doc = all.find((d) => String(d.id) === id) ?? ({} as Doc);
  useDocumentTitle(doc.number ? String(doc.number) : "Document");
  const loaded = invoices.data || quotations.data || orders.data;
  if (!loaded || !doc.number) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-96 rounded-xl bg-muted" /></div>
      </PageContainer>
    );
  }
  const num = String(doc.number ?? "");
  const kind = num.startsWith("QT") ? "Quotation" : num.startsWith("SO") ? "Sales Order" : num.startsWith("DO") ? "Delivery Order" : num.startsWith("CN") ? "Credit Note" : "Invoice";
  return (
    <DocDetails
      doc={doc} kind={kind} number={num}
      backTo={ROUTES.SALES.INVOICES} backLabel="Invoices"
      partyLabel="Bill to" party={String(doc.customer ?? "—")}
      showApproval approvePermission={PERMISSIONS.SALES_APPROVE}
    />
  );
}

export function CreditNotesPage() {
  useDocumentTitle("Credit Notes");
  return (
    <ResourcePage<Doc>
      title="Credit Notes" description="Refunds and credit adjustments against invoices."
      breadcrumbs={[{ label: "Sales" }, { label: "Credit Notes" }]}
      listHook={(p: ListParams) => useCreditNotes(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "approved", "sent"])}
      exportFilename="credit-notes" createFields={docFields} {...perms}
      invalidateKeys={[QUERY_KEYS.creditNotes]}
    />
  );
}

export function PaymentsPage() {
  useDocumentTitle("Sales Payments");
  return (
    <ResourcePage<Doc>
      title="Payments" description="Customer receipts across all payment methods."
      breadcrumbs={[{ label: "Sales" }, { label: "Payments" }]}
      listHook={(p: ListParams) => usePayments(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
        { key: "customer", header: "Customer", accessor: (r) => <EntityCell name={String(r.customer)} sub={String(r.invoiceNumber)} /> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "method", header: "Method" },
        { key: "reference", header: "Reference", accessor: (r) => <span className="text-muted-foreground">{String(r.reference)}</span> },
        { key: "amount", header: "Amount", align: "right", sortable: true, accessor: (r) => <span className="font-bold text-emerald-600">{formatCurrency(Number(r.amount))}</span> },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[{ key: "method", label: "Method", options: ["Bank Transfer", "Credit Card", "Cash", "Check", "Online"].map((m) => ({ label: m, value: m })) }]}
      exportFilename="sales-payments"
      createFields={[
        { name: "customer", label: "Customer", type: "text", required: true },
        { name: "invoiceNumber", label: "Invoice", type: "text", required: true },
        { name: "amount", label: "Amount", type: "currency", required: true, min: 0 },
        { name: "method", label: "Method", type: "select", required: true, options: ["Bank Transfer", "Credit Card", "Cash", "Check", "Online"].map((m) => ({ label: m, value: m })) },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "reference", label: "Reference", type: "text" },
      ]}
      {...perms}
      invalidateKeys={[QUERY_KEYS.payments]}
    />
  );
}

export function SalesReturnsPage() {
  useDocumentTitle("Sales Returns");
  return (
    <ResourcePage<Doc>
      title="Sales Returns" description="RMA flow: receive, inspect, refund or restock."
      breadcrumbs={[{ label: "Sales" }, { label: "Returns" }]}
      listHook={(p: ListParams) => useSalesReturns(p) as never}
      columns={() => docColumns([])}
      filterDefs={statusFilter(["draft", "pending_approval", "approved", "completed"])}
      exportFilename="sales-returns" createFields={docFields} {...perms}
      invalidateKeys={[QUERY_KEYS.salesReturns]}
    />
  );
}
