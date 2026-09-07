import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRightLeft, PackagePlus } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import {
  useAdjustmentsFallback, useCategories, useMovements, useProduct,
  useProducts, useTransfers, useWarehouses,
} from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Tabs } from "@/components/ui/primitives";
import { DataTable } from "@/components/common/DataTable";
import { DetailGrid, EntityCell, PageContainer, PageHeader, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage } from "@/components/common/crud";
import { DonutChart } from "@/components/charts/widgets";
import { toast } from "@/stores/toast.store";
import { exportToCSV } from "@/utils/helpers";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;
const P = PERMISSIONS;

const productFields: FieldConfig[] = [
  { name: "name", label: "Product name", type: "text", required: true },
  { name: "sku", label: "SKU", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["Furniture", "IT Equipment", "Office Supplies", "Electronics", "Stationery", "Cleaning", "Safety", "Kitchen", "Lighting", "Storage"].map((c) => ({ label: c, value: c })) },
  { name: "brand", label: "Brand", type: "select", options: ["Nexora", "ErgoMax", "TechLine", "OfficePro", "BrightLux", "SafeGuard"].map((b) => ({ label: b, value: b })) },
  { name: "costPrice", label: "Cost price", type: "currency", min: 0 },
  { name: "salePrice", label: "Sale price", type: "currency", required: true, min: 0 },
  { name: "stock", label: "Opening stock", type: "number", min: 0 },
  { name: "reorderLevel", label: "Reorder level", type: "number", min: 0 },
  { name: "warehouse", label: "Warehouse", type: "select", options: [{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }] },
  { name: "supplier", label: "Preferred supplier", type: "text" },
];

export function ProductsPage() {
  useDocumentTitle("Products");
  const navigate = useNavigate();
  return (
    <ResourcePage<Row>
      title="Products" description="Master catalog with pricing, stock and valuation."
      breadcrumbs={[{ label: "Inventory" }, { label: "Products" }]}
      listHook={(p: ListParams) => useProducts(p) as never}
      columns={() => [
        { key: "name", header: "Product", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={`${r.sku} · ${r.barcode}`} /> },
        { key: "category", header: "Category" },
        { key: "brand", header: "Brand" },
        { key: "salePrice", header: "Price", align: "right", sortable: true, accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.salePrice))}</span> },
        { key: "stock", header: "Stock", align: "right", sortable: true, accessor: (r) => <span className="font-bold">{formatNumber(Number(r.stock))}</span> },
        { key: "available", header: "Available", align: "right", accessor: (r) => formatNumber(Number(r.available)) },
        { key: "warehouse", header: "Warehouse" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[
        { key: "status", label: "Status", options: ["in_stock", "low_stock", "out_of_stock", "on_order"].map((s) => ({ label: humanize(s), value: s })) },
        { key: "category", label: "Category", options: ["Furniture", "IT Equipment", "Office Supplies", "Electronics", "Stationery"].map((c) => ({ label: c, value: c })) },
      ]}
      exportFilename="products"
      createFields={productFields}
      createPermission={P.PRODUCTS_CREATE} updatePermission={P.PRODUCTS_UPDATE} deletePermission={P.PRODUCTS_DELETE}
      onRowClick={(r) => navigate(`/inventory/products/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.products]}
    />
  );
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { data } = useProduct(id);
  const [tab, setTab] = React.useState("general");
  useDocumentTitle(data ? String(data.name) : "Product");
  const p = data as Row | undefined;
  const movements = useMovements({ page: 1, pageSize: 50, search: p ? String(p.sku) : "" });

  if (!p) {
    return <PageContainer><div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div></PageContainer>;
  }

  const stockPct = Math.min(100, Math.round((Number(p.stock) / Math.max(1, Number(p.reorderLevel) * 4)) * 100));

  return (
    <PageContainer>
      <PageHeader
        title={String(p.name)}
        description={`${p.sku} · ${p.category} · ${p.brand}`}
        breadcrumbs={[{ label: "Inventory" }, { label: "Products", to: ROUTES.INVENTORY.PRODUCTS }, { label: String(p.sku) }]}
        actions={
          <>
            <StatusBadge status={String(p.status)} />
            <Button variant="outline" size="sm" onClick={() => toast("Stock adjusted", { message: "Cycle count posted for " + String(p.sku) })}><PackagePlus className="h-4 w-4" /> Adjust stock</Button>
            <Button size="sm" onClick={() => toast("Transfer created", { message: "Draft transfer created for this product." })}><ArrowRightLeft className="h-4 w-4" /> Transfer</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["On hand", formatNumber(Number(p.stock))],
          ["Reserved", formatNumber(Number(p.reserved))],
          ["Available", formatNumber(Number(p.available))],
          ["Valuation", formatCurrency(Number(p.valuation))],
        ].map(([k, v]) => (
          <Card key={k}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-xl font-bold">{v as string}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">Stock health (reorder level: {formatNumber(Number(p.reorderLevel))})</span>
            <span className="font-bold">{stockPct}%</span>
          </div>
          <Progress value={stockPct} className="mt-2" />
        </CardContent>
      </Card>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "general", label: "General" }, { value: "pricing", label: "Pricing & Tax" }, { value: "stock", label: "Warehouse Stock" }, { value: "history", label: "Stock History" }, { value: "movements", label: "Movements" }]} />
      {tab === "general" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "SKU", value: String(p.sku) },
          { label: "Barcode", value: String(p.barcode) },
          { label: "Category", value: String(p.category) },
          { label: "Brand", value: String(p.brand) },
          { label: "Preferred supplier", value: String(p.supplier) },
          { label: "Primary warehouse", value: String(p.warehouse) },
        ]} /></CardContent></Card>
      )}
      {tab === "pricing" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "Cost price", value: formatCurrency(Number(p.costPrice)) },
          { label: "Sale price", value: formatCurrency(Number(p.salePrice)) },
          { label: "Margin", value: `${(((Number(p.salePrice) - Number(p.costPrice)) / Math.max(1, Number(p.salePrice))) * 100).toFixed(1)}%` },
          { label: "Tax rate", value: `${p.taxRate}%` },
          { label: "Price incl. tax", value: formatCurrency(Number(p.salePrice) * 1.15) },
          { label: "Valuation method", value: "Weighted average (AVCO)" },
        ]} /></CardContent></Card>
      )}
      {tab === "stock" && (
        <Card>
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Warehouse</th><th className="py-2 pr-4 text-right">On hand</th><th className="py-2 pr-4 text-right">Reserved</th><th className="py-2 text-right">Available</th></tr></thead>
                <tbody>
                  {["WH-East", "WH-West", "WH-Central"].map((w, i) => {
                    const onHand = i === 0 ? Number(p.stock) : Math.floor(Number(p.stock) * (i === 1 ? 0.4 : 0.25));
                    return (
                      <tr key={w} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{w}</td>
                        <td className="py-2.5 pr-4 text-right">{formatNumber(onHand)}</td>
                        <td className="py-2.5 pr-4 text-right">{formatNumber(Math.floor(onHand * 0.1))}</td>
                        <td className="py-2.5 text-right font-semibold">{formatNumber(Math.floor(onHand * 0.9))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {(tab === "history" || tab === "movements") && (
        <DataTable<Row>
          columns={[
            { key: "number", header: "Reference", accessor: (r) => <span className="font-medium">{String(r.number)}</span> },
            { key: "date", header: "Date", accessor: (r) => formatDate(String(r.date)) },
            { key: "type", header: "Type", accessor: (r) => <StatusBadge status={r.type === "in" ? "completed" : r.type === "out" ? "in_progress" : "review"} /> },
            { key: "qty", header: "Qty", align: "right", accessor: (r) => formatNumber(Number(r.qty)) },
            { key: "from", header: "From" },
            { key: "to", header: "To" },
            { key: "reference", header: "Document" },
          ]}
          query={{ data: movements.data as never, isLoading: movements.isLoading, isError: movements.isError, refetch: () => movements.refetch() }}
          exportFilename="product-movements"
        />
      )}
    </PageContainer>
  );
}

export function CategoriesPage() {
  useDocumentTitle("Product Categories");
  return (
    <ResourcePage<Row>
      title="Categories" description="Product taxonomy for catalog and reporting."
      breadcrumbs={[{ label: "Inventory" }, { label: "Categories" }]}
      listHook={(p: ListParams) => useCategories(p) as never}
      columns={() => [
        { key: "name", header: "Category", sortable: true, accessor: (r) => <EntityCell name={String(r.name)} sub={String(r.code)} /> },
        { key: "description", header: "Description", accessor: (r) => <span className="text-muted-foreground">{String(r.description)}</span> },
        { key: "products", header: "Products", align: "right", accessor: (r) => formatNumber(Number(r.products)) },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      exportFilename="categories"
      createFields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "code", label: "Code", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", fullWidth: true },
      ]}
      createPermission={P.PRODUCTS_CREATE} updatePermission={P.PRODUCTS_UPDATE} deletePermission={P.PRODUCTS_DELETE}
      invalidateKeys={[QUERY_KEYS.categories]}
    />
  );
}

export function WarehousesPage() {
  useDocumentTitle("Warehouses");
  const wh = useWarehouses({ page: 1, pageSize: 20 });
  return (
    <PageContainer>
      <PageHeader title="Warehouses" description="Storage network, capacity and valuation." breadcrumbs={[{ label: "Inventory" }, { label: "Warehouses" }]} actions={<Button size="sm" onClick={() => toast("Warehouse added", { message: "New storage location created." })}>New warehouse</Button>} />
      <div className="grid gap-5 md:grid-cols-2">
        {(wh.data?.data ?? []).map((w) => (
          <Card key={String(w.id)}>
            <CardHeader>
              <div>
                <CardTitle>{String(w.name)}</CardTitle>
                <p className="text-xs text-muted-foreground">{String(w.code)} · {String(w.city)} · {humanize(String(w.type))}</p>
              </div>
              <StatusBadge status={String(w.status)} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Occupancy</span><span className="font-bold">{Number(w.occupancy)}%</span></div>
                <Progress value={Number(w.occupancy)} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["Products", formatNumber(Number(w.products))], ["Value", formatCurrency(Number(w.value))], ["Manager", String(w.manager).split(" ")[0]]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-muted/40 p-2.5"><p className="text-[11px] text-muted-foreground">{k}</p><p className="text-sm font-bold">{v as string}</p></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

export function MovementsPage() {
  useDocumentTitle("Stock Movements");
  return (
    <ResourcePage<Row>
      title="Stock Movements" description="Complete audit trail of every stock change."
      breadcrumbs={[{ label: "Inventory" }, { label: "Movements" }]}
      listHook={(p: ListParams) => useMovements(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-medium text-primary">{String(r.number)}</span> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "product", header: "Product", accessor: (r) => <EntityCell name={String(r.product)} sub={String(r.sku)} /> },
        { key: "type", header: "Type", accessor: (r) => <StatusBadge status={r.type === "in" ? "completed" : r.type === "out" ? "in_progress" : "review"} /> },
        { key: "qty", header: "Qty", align: "right", accessor: (r) => formatNumber(Number(r.qty)) },
        { key: "from", header: "From" },
        { key: "to", header: "To" },
        { key: "reference", header: "Document" },
      ]}
      filterDefs={[{ key: "type", label: "Type", options: [{ label: "Stock in", value: "in" }, { label: "Stock out", value: "out" }, { label: "Transfer", value: "transfer" }, { label: "Adjustment", value: "adjustment" }] }]}
      exportFilename="stock-movements"
      invalidateKeys={[QUERY_KEYS.movements]}
    />
  );
}

export function TransfersPage() {
  useDocumentTitle("Stock Transfers");
  return (
    <ResourcePage<Row>
      title="Stock Transfers" description="Move stock between warehouses with approval."
      breadcrumbs={[{ label: "Inventory" }, { label: "Transfers" }]}
      listHook={(p: ListParams) => useTransfers(p) as never}
      columns={() => [
        { key: "number", header: "Number", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "from", header: "From" },
        { key: "to", header: "To" },
        { key: "products", header: "Lines", align: "right", accessor: (r) => formatNumber(Number(r.products)) },
        { key: "qty", header: "Total qty", align: "right", accessor: (r) => formatNumber(Number(r.qty)) },
        { key: "requester", header: "Requester" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      exportFilename="stock-transfers"
      createFields={[
        { name: "from", label: "From warehouse", type: "select", required: true, options: [{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }] },
        { name: "to", label: "To warehouse", type: "select", required: true, options: [{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }] },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "requester", label: "Requester", type: "text" },
      ]}
      createPermission={P.INVENTORY_TRANSFER} updatePermission={P.INVENTORY_TRANSFER}
      invalidateKeys={[QUERY_KEYS.transfers]}
    />
  );
}

export function AdjustmentsPage() {
  useDocumentTitle("Stock Adjustments");
  const q = useAdjustmentsFallback({ page: 1, pageSize: 10 });
  return (
    <PageContainer>
      <PageHeader title="Stock Adjustments" description="Cycle counts, write-offs and corrections." breadcrumbs={[{ label: "Inventory" }, { label: "Adjustments" }]} actions={<Button size="sm" onClick={() => toast("Adjustment posted", { message: "ADJ-2026-0901 posted to inventory." })}>New adjustment</Button>} />
      <DataTable<Row>
        columns={[
          { key: "number", header: "Number", accessor: (r) => <span className="font-medium text-primary">{String(r.number)}</span> },
          { key: "date", header: "Date", accessor: (r) => formatDate(String(r.date)) },
          { key: "product", header: "Product", accessor: (r) => <EntityCell name={String(r.product)} sub={String(r.sku)} /> },
          { key: "qty", header: "Qty", align: "right", accessor: (r) => formatNumber(Number(r.qty)) },
          { key: "from", header: "Warehouse", accessor: (r) => String(r.from) },
          { key: "reference", header: "Reason", accessor: (r) => String(r.reference) },
          { key: "user", header: "Posted by" },
        ]}
        query={{ data: q.data, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch() }}
        exportFilename="adjustments"
      />
    </PageContainer>
  );
}

export function ValuationPage() {
  useDocumentTitle("Inventory Valuation");
  const products = useProducts({ page: 1, pageSize: 100 });
  const rows = (products.data?.data ?? []) as Row[];
  const total = rows.reduce((a, r) => a + Number(r.valuation ?? 0), 0);
  const byCat = React.useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(String(r.category), (map.get(String(r.category)) ?? 0) + Number(r.valuation ?? 0)));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  return (
    <PageContainer>
      <PageHeader title="Inventory Valuation" description="AVCO valuation across the storage network." breadcrumbs={[{ label: "Inventory" }, { label: "Valuation" }]} actions={<Button variant="outline" size="sm" onClick={() => exportToCSV(rows as never, "inventory-valuation")}>Export valuation</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Total valuation", formatCurrency(total)], ["SKUs", formatNumber(rows.length)], ["Avg. unit cost", formatCurrency(rows.length ? total / Math.max(1, rows.reduce((a, r) => a + Number(r.stock ?? 0), 0)) : 0)]].map(([k, v]) => (
          <Card key={k}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-xl font-bold">{v as string}</p></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <DonutChart title="Valuation by Category" data={byCat} loading={products.isLoading} currency />
        <Card>
          <CardHeader><CardTitle>Top valued products</CardTitle><Link to={ROUTES.INVENTORY.PRODUCTS} className="text-xs font-medium text-primary hover:underline">View all</Link></CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {[...rows].sort((a, b) => Number(b.valuation) - Number(a.valuation)).slice(0, 7).map((r) => (
                <li key={String(r.id)} className="flex items-center justify-between py-2.5">
                  <EntityCell name={String(r.name)} sub={`${r.sku} · ${formatNumber(Number(r.stock))} units`} />
                  <span className="text-[13px] font-bold">{formatCurrency(Number(r.valuation))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
