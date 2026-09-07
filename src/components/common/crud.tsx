/* Generic CRUD engine: ResourcePage + GenericFormDialog + DocDetails + ToastHost.
   All list modules are configuration, not duplicated code. */
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Info, MoreHorizontal, Pencil, Plus, Printer, RefreshCw, Trash2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ColumnDef, ListParams, PaginatedResponse } from "@/types";
import { PAGINATION } from "@/constants/app";
import { cn } from "@/utils/cn";
import { useDebounce, useModal, usePermissions, useTableParams } from "@/hooks/core";
import { useInvalidate, useMockMutation } from "@/hooks/queries";
import { useToastStore, toast } from "@/stores/toast.store";
import { Badge, Button, Card, CardContent, Dialog, Dropdown, FormField, Input, Select, Textarea } from "@/components/ui/primitives";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog, DocNote, DocTotals, EntityCell, PageContainer, PageHeader, StatusBadge } from "@/components/common/feedback";
import { humanize } from "@/utils/helpers";
import { formatCurrency, formatDate } from "@/utils/format";

/* ================= Toast host ================= */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-2xl animate-in slide-in-from-right duration-200" role="status">
          {t.variant === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
          {t.variant === "error" && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
          {t.variant === "info" && <Info className="h-5 w-5 shrink-0 text-sky-500" />}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">{t.title}</p>
            {t.message && <p className="text-xs text-muted-foreground">{t.message}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
      ))}
    </div>
  );
}

/* ================= Field config → form ================= */
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "currency" | "select" | "textarea" | "date" | "tel";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  min?: number;
}

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodTypeAny;
    if (f.type === "number" || f.type === "currency") {
      s = z.coerce.number();
      if (f.min !== undefined) s = (s as z.ZodNumber).min(f.min, `${f.label} must be at least ${f.min}`);
      if (!f.required) s = s.optional();
    } else {
      s = z.string();
      if (f.type === "email") s = (s as z.ZodString).email("Enter a valid email address");
      if (f.required) s = (s as z.ZodString).min(1, `${f.label} is required`);
      else s = (s as z.ZodString).optional();
    }
    shape[f.name] = s;
  }
  return z.object(shape);
}

export function GenericForm({ fields, defaults, onSubmit, submitLabel, submitting }: {
  fields: FieldConfig[];
  defaults?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}) {
  const schema = React.useMemo(() => buildSchema(fields), [fields]);
  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: defaults ?? {},
  });

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
      {fields.map((f) => (
        <div key={f.name} className={cn(f.fullWidth && "sm:col-span-2")}>
          <FormField label={f.label} required={f.required} error={(errors[f.name]?.message as string) ?? undefined}>
            {f.type === "textarea" ? (
              <Textarea {...register(f.name)} placeholder={f.placeholder} rows={3} />
            ) : f.type === "select" ? (
              <Select {...register(f.name)} placeholder={`Select ${f.label.toLowerCase()}`} options={f.options} />
            ) : (
              <Input {...register(f.name)} type={f.type === "currency" || f.type === "number" ? "number" : f.type === "date" ? "date" : f.type} placeholder={f.placeholder} min={f.min} step={f.type === "currency" ? "0.01" : undefined} />
            )}
          </FormField>
        </div>
      ))}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

/* ================= Resource page ================= */
export interface ResourcePageProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
  listHook: (params: ListParams) => UseQueryResult<PaginatedResponse<T>>;
  columns: (actions: { onEdit: (row: T) => void; onDelete: (row: T) => void }) => ColumnDef<T>[];
  filterDefs?: { key: string; label: string; options: { label: string; value: string }[] }[];
  exportFilename: string;
  searchPlaceholder?: string;
  createFields?: FieldConfig[];
  createTitle?: string;
  editTitle?: string;
  createPermission?: string;
  updatePermission?: string;
  deletePermission?: string;
  onRowClick?: (row: T) => void;
  extraActions?: React.ReactNode;
  emptyTitle?: string;
  invalidateKeys?: string[];
  defaultSort?: string;
}

export function ResourcePage<T extends Record<string, unknown>>({
  title, description, breadcrumbs, listHook, columns, filterDefs = [],
  exportFilename, searchPlaceholder, createFields, createTitle, editTitle,
  createPermission, updatePermission, deletePermission, onRowClick, extraActions,
  emptyTitle, invalidateKeys = [], defaultSort = "createdAt",
}: ResourcePageProps<T>) {
  const { page, pageSize, search, sortBy, sortDir, setPage, setSearch, setSorting } = useTableParams(defaultSort);
  const [localSearch, setLocalSearch] = React.useState(search);
  const debounced = useDebounce(localSearch, 350);
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const { can } = usePermissions();
  const invalidate = useInvalidate();
  const mutation = useMockMutation(invalidateKeys);

  const formModal = useModal<T>();
  const deleteModal = useModal<T>();
  const [bulkDelete, setBulkDelete] = React.useState<T[] | null>(null);

  React.useEffect(() => {
    setLocalSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = listHook({
    page, pageSize: pageSize || PAGINATION.DEFAULT_PAGE_SIZE,
    search: debounced, sortBy, sortDir, filters,
  });

  const canCreate = !createPermission || can(createPermission);
  const canUpdate = !updatePermission || can(updatePermission);
  const canDelete = !deletePermission || can(deletePermission);

  const handleSearch = (v: string) => {
    setLocalSearch(v);
    setSearch(v);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    await mutation.mutateAsync({ action: formModal.payload ? "update" : "create", data });
    toast(formModal.payload ? `${title.slice(0, -1)} updated` : `${title.slice(0, -1)} created`, {
      message: formModal.payload ? "Changes have been saved." : "The new record is now available.",
    });
    formModal.hide();
  };

  const handleDelete = async () => {
    await mutation.mutateAsync({ action: "delete", data: deleteModal.payload });
    invalidate(invalidateKeys);
    toast("Record deleted", { message: "The record has been removed.", variant: "info" });
    deleteModal.hide();
  };

  const handleBulkDelete = async () => {
    await mutation.mutateAsync({ action: "bulk-delete", data: { count: bulkDelete?.length } });
    invalidate(invalidateKeys);
    toast(`${bulkDelete?.length} records deleted`, { variant: "info" });
    setBulkDelete(null);
  };

  const cols = React.useMemo(
    () => [
      ...columns({
        onEdit: (row) => formModal.show(row),
        onDelete: (row) => deleteModal.show(row),
      }),
      ...(canUpdate || canDelete
        ? [{
            key: "_actions", header: "", width: "60px", align: "right" as const,
            accessor: (row: T) => (
              <span onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  trigger={<Button variant="ghost" size="icon-sm" aria-label="Row actions"><MoreHorizontal className="h-4 w-4" /></Button>}
                  items={[
                    ...(canUpdate ? [{ label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => formModal.show(row) }] : []),
                    { label: "Duplicate", onClick: () => { toast("Record duplicated", { message: "A copy was created as draft." }); invalidate(invalidateKeys); } },
                    { label: "Print", icon: <Printer className="h-3.5 w-3.5" />, onClick: () => window.print() },
                    ...(canDelete ? [{ label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, onClick: () => deleteModal.show(row) }] : []),
                  ]}
                />
              </span>
            ),
          } satisfies ColumnDef<T>]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, canUpdate, canDelete]
  );

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            {extraActions}
            <Button variant="outline" size="sm" onClick={() => query.refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            {createFields && canCreate && (
              <Button size="sm" onClick={() => formModal.show()}>
                <Plus className="h-4 w-4" /> New {title.replace(/s$/, "").split(" ").pop()}
              </Button>
            )}
          </>
        }
      />

      <DataTable<T>
        columns={cols}
        query={{ data: query.data, isLoading: query.isLoading, isError: query.isError, refetch: () => query.refetch() }}
        search={localSearch}
        onSearch={handleSearch}
        searchPlaceholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={setSorting}
        page={page}
        onPage={setPage}
        selectable
        bulkActions={canDelete ? [{ label: "Delete selected", variant: "danger", icon: <Trash2 className="h-3.5 w-3.5" />, onSelect: (rows) => setBulkDelete(rows) }] : []}
        filters={filterDefs.map((f) => ({ ...f, value: filters[f.key], onChange: (v) => { setFilters((p) => ({ ...p, [f.key]: v })); setPage(1); } }))}
        exportFilename={exportFilename}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
      />

      {createFields && (
        <Dialog
          open={formModal.open}
          onClose={formModal.hide}
          title={formModal.payload ? (editTitle ?? `Edit ${title.slice(0, -1).toLowerCase()}`) : (createTitle ?? `New ${title.slice(0, -1).toLowerCase()}`)}
          description={formModal.payload ? "Update the record details below." : "Fill in the details to create a new record."}
          width="max-w-2xl"
        >
          <GenericForm
            fields={createFields}
            defaults={(formModal.payload as Record<string, unknown>) ?? {}}
            onSubmit={handleSave}
            submitLabel={formModal.payload ? "Save changes" : "Create"}
            submitting={mutation.isPending}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={deleteModal.open}
        onClose={deleteModal.hide}
        onConfirm={handleDelete}
        title="Delete record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={mutation.isPending}
      />
      <ConfirmDialog
        open={bulkDelete !== null}
        onClose={() => setBulkDelete(null)}
        onConfirm={handleBulkDelete}
        title={`Delete ${bulkDelete?.length} records`}
        message="Are you sure you want to delete the selected records? This action cannot be undone."
        confirmLabel="Delete all"
        danger
        loading={mutation.isPending}
      />
    </PageContainer>
  );
}

/* ================= Document details (invoices, orders, …) ================= */
export interface DocLine { product?: string; sku?: string; qty?: number; unitPrice?: number; discount?: number; tax?: number; total?: number; [k: string]: unknown }

export function DocDetails({ doc, kind, number, backTo, backLabel, partyLabel, party, showApproval, approvePermission }: {
  doc: Record<string, unknown>;
  kind: string;
  number: string;
  backTo: string;
  backLabel: string;
  partyLabel: string;
  party: string;
  showApproval?: boolean;
  approvePermission?: string;
}) {
  const { can } = usePermissions();
  const mutation = useMockMutation();
  const [status, setStatus] = React.useState(String(doc.status ?? "draft"));
  const items = (doc.items as DocLine[]) ?? [];
  const canApprove = !approvePermission || can(approvePermission);

  const act = async (action: "approved" | "rejected" | "sent") => {
    await mutation.mutateAsync({ action });
    setStatus(action);
    toast(`Document ${action}`, { message: `${number} has been ${action}.` });
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${kind} ${number}`}
        description={`${partyLabel}: ${party} · ${formatDate(String(doc.date ?? doc.createdAt ?? new Date().toISOString()))}`}
        breadcrumbs={[{ label: backLabel, to: backTo }, { label: number }]}
        actions={
          <>
            <StatusBadge status={status} />
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            {showApproval && canApprove && (status === "pending_approval" || status === "pending" || status === "draft" || status === "sent") && (
              <>
                <Button variant="outline" size="sm" onClick={() => act("rejected")} loading={mutation.isPending}>Reject</Button>
                <Button size="sm" onClick={() => act("approved")} loading={mutation.isPending}>Approve</Button>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardContent className="pt-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4 font-semibold">Item</th>
                      <th className="py-2 pr-4 font-semibold">SKU</th>
                      <th className="py-2 pr-4 text-right font-semibold">Qty</th>
                      <th className="py-2 pr-4 text-right font-semibold">Unit price</th>
                      <th className="py-2 pr-4 text-right font-semibold">Discount</th>
                      <th className="py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((li, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{String(li.product ?? "—")}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{String(li.sku ?? "—")}</td>
                        <td className="py-2.5 pr-4 text-right">{Number(li.qty ?? 0)}</td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(li.unitPrice ?? 0))}</td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(li.discount ?? 0))}</td>
                        <td className="py-2.5 text-right font-semibold">{formatCurrency(Number(li.total ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex justify-end">
                <DocTotals
                  subtotal={formatCurrency(Number(doc.subtotal ?? 0))}
                  discount={formatCurrency(Number(doc.discount ?? 0))}
                  tax={formatCurrency(Number(doc.tax ?? 0))}
                  total={formatCurrency(Number(doc.total ?? 0))}
                  paid={doc.paidAmount !== undefined ? formatCurrency(Number(doc.paidAmount)) : undefined}
                  balance={doc.balance !== undefined ? formatCurrency(Number(doc.balance)) : undefined}
                />
              </div>
              <div className="mt-5"><DocNote /></div>
            </CardContent>
          </Card>

          {doc.notes ? (
            <Card><CardContent className="pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p><p className="mt-1 text-sm">{String(doc.notes)}</p></CardContent></Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3 pt-5 text-sm">
              <EntityCell name={party} sub={partyLabel} />
              <div className="h-px bg-border" />
              {[
                ["Status", <StatusBadge key="s" status={status} />],
                ["Date", formatDate(String(doc.date ?? doc.createdAt ?? new Date().toISOString()))],
                ...(doc.dueDate ? [["Due date", formatDate(String(doc.dueDate))]] : []),
                ...(doc.expectedDate ? [["Expected", formatDate(String(doc.expectedDate))]] : []),
                ["Salesperson", String(doc.salesperson ?? doc.requester ?? "—")],
                ["Warehouse", String(doc.warehouse ?? "—")],
              ].map(([k, v], i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v as React.ReactNode}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2.5 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</p>
              {[
                ["Document created", formatDate(String(doc.createdAt ?? new Date().toISOString()))],
                ["Last updated", formatDate(String(doc.updatedAt ?? new Date().toISOString()))],
                ["Current status", humanize(status)],
              ].map(([a, t], i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <span>{a}</span><Badge variant="secondary">{t as string}</Badge>
                </div>
              ))}
              <Link to={backTo} className="block pt-1 text-[13px] font-medium text-primary hover:underline">← Back to {backLabel.toLowerCase()}</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
