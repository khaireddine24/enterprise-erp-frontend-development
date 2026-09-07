import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import { useAsset, useAssets } from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Tabs } from "@/components/ui/primitives";
import { DetailGrid, EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatCurrency, formatDate } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;
const P = PERMISSIONS;

export function AssetsPage() {
  useDocumentTitle("Assets");
  const navigate = useNavigate();
  return (
    <ResourcePage<Row>
      title="Assets" description="Fixed assets with assignment and depreciation."
      breadcrumbs={[{ label: "Assets" }]}
      listHook={(p: ListParams) => useAssets(p) as never}
      columns={() => [
        { key: "name", header: "Asset", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={`${r.code} · ${r.category}`} /> },
        { key: "assignedTo", header: "Assigned to", accessor: (r) => (r.assignedTo ? String(r.assignedTo) : <span className="text-muted-foreground">—</span>) },
        { key: "location", header: "Location" },
        { key: "purchasePrice", header: "Purchase", align: "right", accessor: (r) => formatCurrency(Number(r.purchasePrice)) },
        { key: "currentValue", header: "Net book value", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatCurrency(Number(r.currentValue))}</span> },
        { key: "condition", header: "Condition", accessor: (r) => <span className="text-muted-foreground">{humanize(String(r.condition))}</span> },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[
        { key: "status", label: "Status", options: ["available", "assigned", "in_maintenance", "retired"].map((s) => ({ label: humanize(s), value: s })) },
        { key: "category", label: "Category", options: ["IT Equipment", "Furniture", "Vehicles", "Machinery", "Buildings"].map((c) => ({ label: c, value: c })) },
      ]}
      exportFilename="assets"
      createFields={[
        { name: "name", label: "Asset name", type: "text", required: true },
        { name: "category", label: "Category", type: "select", required: true, options: ["IT Equipment", "Furniture", "Vehicles", "Machinery", "Buildings"].map((c) => ({ label: c, value: c })) },
        { name: "purchasePrice", label: "Purchase price", type: "currency", required: true, min: 0 },
        { name: "purchaseDate", label: "Purchase date", type: "date" },
        { name: "location", label: "Location", type: "text" },
        { name: "depreciation", label: "Depreciation %/yr", type: "number", min: 0 },
      ]}
      createPermission={P.ASSETS_CREATE} updatePermission={P.ASSETS_UPDATE} deletePermission={P.ASSETS_DELETE}
      onRowClick={(r) => navigate(`/assets/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.assets]}
    />
  );
}

export function AssetDetailsPage() {
  const { id } = useParams();
  const { data } = useAsset(id);
  const [tab, setTab] = React.useState("overview");
  useDocumentTitle(data ? String(data.name) : "Asset");
  const a = data as Row | undefined;
  const [assignee, setAssignee] = React.useState("");

  if (!a) {
    return <PageContainer><div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div></PageContainer>;
  }

  const depPct = Math.round(((Number(a.purchasePrice) - Number(a.currentValue)) / Math.max(1, Number(a.purchasePrice))) * 100);
  const schedule = [0, 1, 2, 3, 4].map((y) => ({
    year: 2026 + y,
    value: Math.max(0, Math.round(Number(a.purchasePrice) * (1 - (Number(a.depreciation) / 100) * (y + 1)))),
  }));

  return (
    <PageContainer>
      <PageHeader
        title={String(a.name)}
        description={`${a.code} · ${a.category} · ${humanize(String(a.condition))} condition`}
        breadcrumbs={[{ label: "Assets", to: ROUTES.ASSETS.LIST }, { label: String(a.code) }]}
        actions={
          <>
            <StatusBadge status={String(a.status)} />
            <Button variant="outline" size="sm" onClick={() => toast("Maintenance scheduled", { message: "Work order WO-2041 created." })}>Schedule maintenance</Button>
            <Button size="sm" onClick={() => toast(a.assignedTo ? "Asset checked in" : "Asset assigned", { message: a.assignedTo ? "Asset returned to pool." : "Asset assigned to employee." })}>{a.assignedTo ? "Check in" : "Assign"}</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Purchase price" value={formatCurrency(Number(a.purchasePrice))} />
        <StatCard label="Net book value" value={formatCurrency(Number(a.currentValue))} tone="success" />
        <StatCard label="Depreciated" value={`${depPct}%`} tone="warning" />
        <StatCard label="Annual rate" value={`${a.depreciation}%`} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "overview", label: "Overview" }, { value: "assignment", label: "Assignment" }, { value: "depreciation", label: "Depreciation" }, { value: "maintenance", label: "Maintenance" }, { value: "history", label: "History" }]} />
      {tab === "overview" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "Asset code", value: String(a.code) },
          { label: "Category", value: String(a.category) },
          { label: "Location", value: String(a.location) },
          { label: "Purchase date", value: formatDate(String(a.purchaseDate)) },
          { label: "Condition", value: humanize(String(a.condition)) },
          { label: "Warranty", value: "Until Dec 2027" },
        ]} /></CardContent></Card>
      )}
      {tab === "assignment" && (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Currently assigned to</span>
              <span className="font-bold">{a.assignedTo ? String(a.assignedTo) : "Asset pool (available)"}</span>
            </div>
            <div className="flex gap-2">
              <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Employee name…" className="h-10 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Assign to employee" />
              <Button onClick={() => { if (!assignee.trim()) return; toast("Asset assigned", { message: `${a.code} assigned to ${assignee.trim()}.` }); setAssignee(""); }}>Assign</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {tab === "depreciation" && (
        <Card>
          <CardHeader><CardTitle>Straight-line schedule · {String(a.depreciation)}%/year</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Year</th><th className="py-2 pr-4 text-right">Depreciation</th><th className="py-2 text-right">Net book value</th></tr></thead>
                <tbody>
                  {schedule.map((s) => (
                    <tr key={s.year} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{s.year}</td>
                      <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(a.purchasePrice) * (Number(a.depreciation) / 100))}</td>
                      <td className="py-2.5 text-right font-bold">{formatCurrency(s.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {tab === "maintenance" && (
        <Card><CardContent className="space-y-2.5 pt-5">
          {[["WO-2041 — Preventive service", "Scheduled · Sep 20, 2026", "pending"], ["WO-1987 — Battery replacement", "Completed · Jun 02, 2026", "completed"], ["WO-1832 — Annual inspection", "Completed · Jan 14, 2026", "completed"]].map(([t, d, s]) => (
            <div key={t} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px]">
              <span><span className="font-semibold">{t}</span><span className="ml-2 text-xs text-muted-foreground">{d}</span></span>
              <StatusBadge status={s} />
            </div>
          ))}
        </CardContent></Card>
      )}
      {tab === "history" && (
        <Card><CardContent className="space-y-2.5 pt-5">
          {[["Assigned to " + (a.assignedTo ?? "—"), "Aug 2026"], ["Location changed to " + String(a.location), "Mar 2026"], ["Purchased for " + formatCurrency(Number(a.purchasePrice)), formatDate(String(a.purchaseDate))]].map(([t, d]) => (
            <div key={t} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px]">
              <span className="font-medium">{t}</span><span className="text-xs text-muted-foreground">{d}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
      <Card><CardContent className="pt-5">
        <div className="flex justify-between text-[13px]"><span className="font-medium">Lifetime depreciation</span><span className="font-bold">{depPct}%</span></div>
        <Progress value={depPct} className="mt-2" />
      </CardContent></Card>
    </PageContainer>
  );
}

export function MaintenancePage() {
  useDocumentTitle("Asset Maintenance");
  const orders = [
    { id: "WO-2041", asset: "Delivery Van", type: "Preventive", date: "Sep 20, 2026", tech: "Omar Haddad", cost: 450, status: "pending" },
    { id: "WO-2040", asset: "Generator 20kVA", type: "Corrective", date: "Sep 12, 2026", tech: "Ingrid Muller", cost: 1200, status: "in_progress" },
    { id: "WO-2039", asset: "Forklift T3", type: "Inspection", date: "Sep 08, 2026", tech: "Pablo Costa", cost: 300, status: "review" },
    { id: "WO-1987", asset: "Server Dell R750", type: "Corrective", date: "Jun 02, 2026", tech: "Ingrid Muller", cost: 860, status: "completed" },
  ];
  return (
    <PageContainer>
      <PageHeader title="Maintenance" description="Work orders and preventive schedules." breadcrumbs={[{ label: "Assets" }, { label: "Maintenance" }]} actions={<Button size="sm" onClick={() => toast("Work order created")}>New work order</Button>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open orders" value="3" tone="warning" />
        <StatCard label="In progress" value="1" tone="info" />
        <StatCard label="Completed (YTD)" value="47" tone="success" />
        <StatCard label="Maintenance cost (YTD)" value={formatCurrency(18400)} />
      </div>
      <Card>
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Work order</th><th className="py-2 pr-4">Asset</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Scheduled</th><th className="py-2 pr-4">Technician</th><th className="py-2 pr-4 text-right">Cost</th><th className="py-2 text-right">Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-semibold text-primary">{o.id}</td>
                    <td className="py-2.5 pr-4">{o.asset}</td>
                    <td className="py-2.5 pr-4">{o.type}</td>
                    <td className="py-2.5 pr-4">{o.date}</td>
                    <td className="py-2.5 pr-4">{o.tech}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold">{formatCurrency(o.cost)}</td>
                    <td className="py-2.5 text-right"><StatusBadge status={o.status} /></td>
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

export const assetCreateFields: FieldConfig[] = [
  { name: "name", label: "Asset name", type: "text", required: true },
];
