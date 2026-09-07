/* Enterprise DataTable: sort, search, filter, pagination, selection, bulk actions, export, column visibility. */
import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Download, Search } from "lucide-react";
import type { BulkAction, ColumnDef, PaginatedResponse } from "@/types";
import { cn } from "@/utils/cn";
import { exportToCSV, exportToExcel } from "@/utils/helpers";
import { Button, Checkbox, Dropdown, Input, Pagination, Skeleton } from "@/components/ui/primitives";
import { EmptyState, ErrorState } from "@/components/common/feedback";

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string | undefined) => void;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  query: { data?: PaginatedResponse<T>; isLoading: boolean; isError: boolean; refetch: () => void };
  rowKey?: (row: T) => string;
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  page?: number;
  onPage?: (p: number) => void;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  filters?: FilterOption[];
  exportFilename?: string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, query, rowKey, search, onSearch, searchPlaceholder = "Search…",
  sortBy, sortDir, onSort, page = 1, onPage, selectable, bulkActions,
  filters, exportFilename = "export", onRowClick, emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.", toolbar,
}: DataTableProps<T>) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const keyOf = (row: T, i: number) => (rowKey ? rowKey(row) : String(row.id ?? i));
  const visibleColumns = columns.filter((c) => !hidden.has(String(c.key)) && !c.hidden);

  const rows = query.data?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((r, i) => selected.has(keyOf(r, i)));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r, i) => keyOf(r, i))));
  };
  const toggleOne = (k: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectedRows = rows.filter((r, i) => selected.has(keyOf(r, i)));

  const handleExport = (format: "csv" | "xls") => {
    const cols = visibleColumns.map((c) => ({ key: String(c.key), header: c.header }));
    const data = (selectedRows.length > 0 ? selectedRows : rows) as Record<string, unknown>[];
    if (format === "csv") exportToCSV(data, exportFilename, cols);
    else exportToExcel(data, exportFilename);
  };

  const cellValue = (row: T, col: ColumnDef<T>): React.ReactNode => {
    if (col.accessor) return col.accessor(row);
    const v = row[String(col.key)];
    return v === null || v === undefined || v === "" ? <span className="text-muted-foreground">—</span> : String(v);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {onSearch && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={search ?? ""} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder} className="pl-9" aria-label="Search table" />
            </div>
          )}
          {filters?.map((f) => (
            <select
              key={f.key}
              value={f.value ?? ""}
              onChange={(e) => f.onChange(e.target.value || undefined)}
              className="h-9 rounded-md border border-input bg-card px-3 text-[13px] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={f.label}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <Dropdown
            trigger={<Button variant="outline" size="sm"><ChevronDown className="h-4 w-4" /> Columns</Button>}
            items={columns.map((c) => ({
              label: c.header,
              onClick: () =>
                setHidden((prev) => {
                  const next = new Set(prev);
                  const k = String(c.key);
                  if (next.has(k)) next.delete(k);
                  else next.add(k);
                  return next;
                }),
            }))}
          />
          <Dropdown
            trigger={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>}
            items={[
              { label: "Export CSV", onClick: () => handleExport("csv") },
              { label: "Export Excel", onClick: () => handleExport("xls") },
            ]}
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selectable && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[13px]">
          <span className="font-semibold">{selected.size} selected</span>
          <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>Clear</Button>
          <span className="h-4 w-px bg-border" />
          {bulkActions?.map((a, i) => (
            <Button key={i} variant={a.variant === "danger" ? "danger" : "outline"} size="xs" onClick={() => a.onSelect(selectedRows)}>
              {a.icon}{a.label}
            </Button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {selectable && (
                <th className="w-10 px-4 py-3"><Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all rows" /></th>
              )}
              {visibleColumns.map((col) => (
                <th key={String(col.key)} style={col.width ? { width: col.width } : undefined}
                  className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", col.align === "right" && "text-right", col.align === "center" && "text-center")}>
                  {col.sortable && onSort ? (
                    <button onClick={() => onSort(String(col.key))} className="inline-flex items-center gap-1 hover:text-foreground" aria-label={`Sort by ${col.header}`}>
                      {col.header}
                      {sortBy === String(col.key) ? (
                        sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {selectable && <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>}
                  {visibleColumns.map((c) => (
                    <td key={String(c.key)} className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : query.isError ? (
              <tr><td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="px-4 py-10"><ErrorState onRetry={query.refetch} /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="px-4 py-10"><EmptyState title={emptyTitle} description={emptyDescription} /></td></tr>
            ) : (
              rows.map((row, i) => {
                const k = keyOf(row, i);
                return (
                  <tr
                    key={k}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn("border-b border-border last:border-0 transition-colors hover:bg-muted/40", onRowClick && "cursor-pointer", selected.has(k) && "bg-primary/5")}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.has(k)} onChange={() => toggleOne(k)} aria-label={`Select row ${i + 1}`} />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={String(col.key)} className={cn("px-4 py-3", col.align === "right" && "text-right", col.align === "center" && "text-center")}>
                        {cellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {query.data && query.data.total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground" role="status">
            Showing {(query.data.page - 1) * query.data.pageSize + 1}–{Math.min(query.data.page * query.data.pageSize, query.data.total)} of {query.data.total} records
          </p>
          {onPage && <Pagination page={page} totalPages={query.data.totalPages} onChange={onPage} />}
        </div>
      )}
    </div>
  );
}
