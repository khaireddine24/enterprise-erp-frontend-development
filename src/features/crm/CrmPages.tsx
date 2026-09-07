import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Mail, MapPin, Phone, Plus } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import { useCustomer, useContacts, useCustomers, useInvoices, useLeads, useOpportunities, useSalesOrders } from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Avatar, Button, Card, CardContent, CardHeader, CardTitle, Tabs } from "@/components/ui/primitives";
import { DocTotals, DetailGrid, EmptyState, EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage, ToastHost } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatCurrency, formatDate, formatNumber, formatPhone } from "@/utils/format";
import { humanize } from "@/utils/helpers";

void ToastHost;

/* ---------- Customers ---------- */
const customerFields: FieldConfig[] = [
  { name: "name", label: "Customer name", type: "text", required: true, placeholder: "Acme Corp" },
  { name: "type", label: "Type", type: "select", required: true, options: [{ label: "Company", value: "company" }, { label: "Individual", value: "individual" }] },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "contact@company.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+1 (555) 000-0000" },
  { name: "city", label: "City", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "creditLimit", label: "Credit limit", type: "currency", min: 0 },
  { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Prospect", value: "prospect" }] },
  { name: "address", label: "Address", type: "textarea", fullWidth: true },
];

export function CustomersPage() {
  useDocumentTitle("Customers");
  const navigate = useNavigate();
  return (
    <ResourcePage
      title="Customers"
      description="Manage customer accounts, credit and history."
      breadcrumbs={[{ label: "CRM" }, { label: "Customers" }]}
      listHook={(p: ListParams) => useCustomers(p) as never}
      columns={() => [
        { key: "name", header: "Customer", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={String(r.code)} /> },
        { key: "email", header: "Email", accessor: (r) => <span className="text-muted-foreground">{String(r.email)}</span> },
        { key: "city", header: "City", sortable: true, accessor: (r) => `${r.city}, ${r.country}` },
        { key: "totalOrders", header: "Orders", align: "right", sortable: true, accessor: (r) => formatNumber(Number(r.totalOrders)) },
        { key: "totalRevenue", header: "Revenue", align: "right", sortable: true, accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.totalRevenue))}</span> },
        { key: "balance", header: "Balance", align: "right", accessor: (r) => formatCurrency(Number(r.balance)) },
        { key: "owner", header: "Owner" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[{ key: "status", label: "Status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Prospect", value: "prospect" }] }]}
      exportFilename="customers"
      searchPlaceholder="Search customers…"
      createFields={customerFields}
      createPermission={PERMISSIONS.CUSTOMERS_CREATE}
      updatePermission={PERMISSIONS.CUSTOMERS_UPDATE}
      deletePermission={PERMISSIONS.CUSTOMERS_DELETE}
      onRowClick={(r) => navigate(`/crm/customers/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.customers]}
    />
  );
}

/* ---------- Customer details ---------- */
type CustTab = "overview" | "contacts" | "orders" | "invoices" | "payments" | "activities" | "notes" | "documents";

export function CustomerDetailsPage() {
  const { id } = useParams();
  const { data: customer, isLoading } = useCustomer(id);
  const [tab, setTab] = React.useState<CustTab>("overview");
  const [notes, setNotes] = React.useState([
    { id: "n1", author: "Maya Chen", text: "Customer requested quarterly business review in October.", date: "Aug 28, 2026" },
    { id: "n2", author: "Liam Carter", text: "Credit limit increased to $150k after payment history review.", date: "Aug 12, 2026" },
  ]);
  const [draft, setDraft] = React.useState("");
  useDocumentTitle(customer ? String(customer.name) : "Customer");

  const c = customer as Record<string, unknown> | undefined;
  const related = React.useMemo(() => ({ page: 1, pageSize: 50, search: "", filters: { customerId: id } }), [id]);
  const orders = useSalesOrders(related);
  const invoices = useInvoices(related);
  const contacts = useContacts(related);

  if (isLoading || !c) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted" />)}</div>
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </PageContainer>
    );
  }

  const stats = [
    { label: "Total revenue", value: formatCurrency(Number(c.totalRevenue)) },
    { label: "Outstanding balance", value: formatCurrency(Number(c.balance)) },
    { label: "Total orders", value: formatNumber(Number(c.totalOrders)) },
    { label: "Credit limit", value: formatCurrency(Number(c.creditLimit)) },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={String(c.name)}
        description={`${c.code} · ${c.type === "company" ? "Company" : "Individual"} · Owner: ${c.owner}`}
        breadcrumbs={[{ label: "CRM" }, { label: "Customers", to: ROUTES.CRM.CUSTOMERS }, { label: String(c.name) }]}
        actions={
          <>
            <StatusBadge status={String(c.status)} />
            <Button variant="outline" size="sm" onClick={() => toast("Follow-up scheduled", { message: "Reminder set for tomorrow at 10:00." })}>Schedule follow-up</Button>
            <Button size="sm" onClick={() => toast("Quotation created", { message: `Draft quotation started for ${c.name}.` })}><Plus className="h-4 w-4" /> New quotation</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="mt-1 text-xl font-bold">{s.value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs<CustTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "contacts", label: "Contacts", count: contacts.data?.total ?? 0 },
          { value: "orders", label: "Orders", count: orders.data?.total ?? 0 },
          { value: "invoices", label: "Invoices", count: invoices.data?.total ?? 0 },
          { value: "payments", label: "Payments" },
          { value: "activities", label: "Activities" },
          { value: "notes", label: "Notes", count: notes.length },
          { value: "documents", label: "Documents" },
        ]}
      />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>General information</CardTitle></CardHeader>
            <CardContent>
              <DetailGrid
                items={[
                  { label: "Customer code", value: String(c.code) },
                  { label: "Tax ID", value: String(c.taxId) },
                  { label: "Email", value: <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{String(c.email)}</span> },
                  { label: "Phone", value: <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{formatPhone(String(c.phone))}</span> },
                  { label: "Address", value: <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{String(c.address)}</span> },
                  { label: "Customer since", value: formatDate(String(c.createdAt)) },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Customer statistics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Lifetime revenue", formatCurrency(Number(c.totalRevenue))],
                ["Average order value", formatCurrency(Number(c.totalRevenue) / Math.max(1, Number(c.totalOrders)))],
                ["Outstanding balance", formatCurrency(Number(c.balance))],
                ["Credit utilization", `${Math.min(99, Math.round((Number(c.balance) / Math.max(1, Number(c.creditLimit))) * 100))}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">{k}</span><span className="font-bold">{v as string}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "contacts" && (
        <Card>
          <CardContent className="pt-5">
            {contacts.data && contacts.data.total > 0 ? (
              <ul className="divide-y divide-border">
                {contacts.data.data.map((ct) => (
                  <li key={String(ct.id)} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${ct.firstName} ${ct.lastName}`} />
                      <div>
                        <p className="text-sm font-semibold">{String(ct.firstName)} {String(ct.lastName)} {ct.isPrimary ? <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">PRIMARY</span> : null}</p>
                        <p className="text-xs text-muted-foreground">{String(ct.position)} · {String(ct.email)}</p>
                      </div>
                    </div>
                    <span className="text-[13px] text-muted-foreground">{formatPhone(String(ct.phone))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No contacts" description="Add contacts to keep communication history organized." />
            )}
          </CardContent>
        </Card>
      )}

      {tab === "orders" && (
        <MiniDocTable title="Sales orders" rows={(orders.data?.data ?? []) as Record<string, unknown>[]} linkBase="/sales/orders" />
      )}
      {tab === "invoices" && (
        <MiniDocTable title="Invoices" rows={(invoices.data?.data ?? []) as Record<string, unknown>[]} linkBase="/sales/invoices" showBalance />
      )}
      {tab === "payments" && (
        <Card>
          <CardContent className="pt-5">
            <ul className="divide-y divide-border">
              {(invoices.data?.data ?? []).slice(0, 5).map((inv) => (
                <li key={String(inv.id)} className="flex items-center justify-between py-2.5 text-sm">
                  <span>Payment against <Link className="font-medium text-primary hover:underline" to={`/sales/invoices/${inv.id}`}>{String(inv.number)}</Link></span>
                  <span className="font-bold text-emerald-600">{formatCurrency(Number(inv.paidAmount))}</span>
                </li>
              ))}
              {(!invoices.data || invoices.data.total === 0) && <EmptyState title="No payments" description="Payments will appear here once recorded." />}
            </ul>
          </CardContent>
        </Card>
      )}
      {tab === "activities" && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            {[
              ["Invoice INV-2026-1841 sent", "Sep 4, 2026 · by Liam Carter"],
              ["Sales order SO-2026-2214 confirmed", "Aug 30, 2026 · by Maya Chen"],
              ["Follow-up call logged", "Aug 22, 2026 · by Maya Chen"],
              ["Quotation QT-2026-1118 accepted", "Aug 15, 2026 · by system"],
            ].map(([a, t], i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px]">
                <span className="font-medium">{a}</span><span className="text-xs text-muted-foreground">{t}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {tab === "notes" && (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note…" className="h-10 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Add a note" />
              <Button size="sm" onClick={() => { if (!draft.trim()) return; setNotes((n) => [{ id: `n${Date.now()}`, author: "You", text: draft.trim(), date: "Just now" }, ...n]); setDraft(""); toast("Note added"); }}>Add note</Button>
            </div>
            {notes.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-lg bg-muted/40 p-3">
                <Avatar name={n.author} size="sm" />
                <div><p className="text-[13px] font-semibold">{n.author} <span className="ml-1 font-normal text-muted-foreground">· {n.date}</span></p><p className="text-[13px]">{n.text}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {tab === "documents" && (
        <Card>
          <CardContent className="pt-5">
            <ul className="divide-y divide-border">
              {["Master Service Agreement.pdf", "Quotation QT-2026-1118.pdf", "W-9 Tax Form.pdf", "Delivery Proof DO-2026-3304.pdf"].map((d, i) => (
                <li key={d} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{d}</span>
                  <Button variant="ghost" size="xs" onClick={() => toast("Download started", { message: d })}>Download · v{i + 1}</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

function MiniDocTable({ title, rows, linkBase, showBalance }: { title: string; rows: Record<string, unknown>[]; linkBase: string; showBalance?: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()}`} description={`This customer has no ${title.toLowerCase()} yet.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4">Number</th><th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  {showBalance && <th className="py-2 pr-4 text-right">Balance</th>}
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={String(r.id)} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4"><Link className="font-medium text-primary hover:underline" to={`${linkBase}/${r.id}`}>{String(r.number)}</Link></td>
                    <td className="py-2.5 pr-4">{formatDate(String(r.date))}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold">{formatCurrency(Number(r.total))}</td>
                    {showBalance && <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(r.balance))}</td>}
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

/* ---------- Contacts / Leads / Opportunities ---------- */
export function ContactsPage() {
  useDocumentTitle("Contacts");
  return (
    <ResourcePage
      title="Contacts"
      description="Everyone you do business with, linked to customers."
      breadcrumbs={[{ label: "CRM" }, { label: "Contacts" }]}
      listHook={(p: ListParams) => useContacts(p) as never}
      columns={() => [
        { key: "firstName", header: "Contact", sortable: true, accessor: (r) => <EntityCell name={`${r.firstName} ${r.lastName}`} sub={String(r.position)} /> },
        { key: "customerName", header: "Customer", sortable: true },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone", accessor: (r) => formatPhone(String(r.phone)) },
        { key: "isPrimary", header: "Primary", accessor: (r) => (r.isPrimary ? <StatusBadge status="active" /> : <span className="text-muted-foreground">—</span>) },
      ]}
      exportFilename="contacts"
      createFields={[
        { name: "firstName", label: "First name", type: "text", required: true },
        { name: "lastName", label: "Last name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "position", label: "Position", type: "text" },
        { name: "customerName", label: "Customer", type: "text", required: true },
      ]}
      createPermission={PERMISSIONS.CUSTOMERS_CREATE}
      updatePermission={PERMISSIONS.CUSTOMERS_UPDATE}
      deletePermission={PERMISSIONS.CUSTOMERS_DELETE}
      invalidateKeys={[QUERY_KEYS.contacts]}
    />
  );
}

export function LeadsPage() {
  useDocumentTitle("Leads");
  return (
    <ResourcePage
      title="Leads"
      description="Capture, qualify and convert prospects."
      breadcrumbs={[{ label: "CRM" }, { label: "Leads" }]}
      listHook={(p: ListParams) => useLeads(p) as never}
      columns={() => [
        { key: "name", header: "Lead", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={String(r.company)} /> },
        { key: "email", header: "Email" },
        { key: "source", header: "Source" },
        { key: "value", header: "Value", align: "right", sortable: true, accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.value))}</span> },
        { key: "owner", header: "Owner" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[{ key: "status", label: "Status", options: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"].map((s) => ({ label: humanize(s), value: s })) }]}
      exportFilename="leads"
      createFields={[
        { name: "name", label: "Full name", type: "text", required: true },
        { name: "company", label: "Company", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "source", label: "Source", type: "select", options: ["Website", "Referral", "Trade Show", "LinkedIn", "Cold Call", "Partner"].map((s) => ({ label: s, value: s })) },
        { name: "value", label: "Estimated value", type: "currency", min: 0 },
      ]}
      createPermission={PERMISSIONS.LEADS_CREATE}
      updatePermission={PERMISSIONS.LEADS_UPDATE}
      deletePermission={PERMISSIONS.LEADS_DELETE}
      invalidateKeys={[QUERY_KEYS.leads]}
    />
  );
}

export function OpportunitiesPage() {
  useDocumentTitle("Opportunities");
  return (
    <ResourcePage
      title="Opportunities"
      description="Track deals through every pipeline stage."
      breadcrumbs={[{ label: "CRM" }, { label: "Opportunities" }]}
      listHook={(p: ListParams) => useOpportunities(p) as never}
      columns={() => [
        { key: "title", header: "Opportunity", sortable: true, accessor: (r) => <EntityCell name={String(r.title)} sub={String(r.customer)} /> },
        { key: "value", header: "Value", align: "right", sortable: true, accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.value))}</span> },
        { key: "probability", header: "Probability", align: "right", accessor: (r) => `${r.probability}%` },
        { key: "expectedClose", header: "Expected close", accessor: (r) => formatDate(String(r.expectedClose)) },
        { key: "owner", header: "Owner" },
        { key: "stage", header: "Stage", accessor: (r) => <StatusBadge status={String(r.stage)} /> },
      ]}
      filterDefs={[{ key: "stage", label: "Stage", options: ["discovery", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"].map((s) => ({ label: humanize(s), value: s })) }]}
      exportFilename="opportunities"
      createFields={[
        { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
        { name: "customer", label: "Customer", type: "text", required: true },
        { name: "value", label: "Value", type: "currency", required: true, min: 0 },
        { name: "probability", label: "Probability %", type: "number", min: 0 },
        { name: "expectedClose", label: "Expected close", type: "date" },
        { name: "stage", label: "Stage", type: "select", options: ["discovery", "qualification", "proposal", "negotiation"].map((s) => ({ label: humanize(s), value: s })) },
      ]}
      createPermission={PERMISSIONS.OPPORTUNITIES_CREATE}
      updatePermission={PERMISSIONS.OPPORTUNITIES_UPDATE}
      deletePermission={PERMISSIONS.OPPORTUNITIES_DELETE}
      invalidateKeys={[QUERY_KEYS.opportunities]}
    />
  );
}

export function CrmStatsStrip() {
  const { data } = useCustomers({ page: 1, pageSize: 1 });
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Total customers" value={formatNumber(data?.total ?? 0)} />
      <div className="hidden"><DocTotals subtotal="$0" tax="$0" total="$0" /></div>
    </div>
  );
}
