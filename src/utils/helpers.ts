/* Pure, framework-free helpers: strings, objects, arrays, files, export, tables. */

/* ---------- Strings ---------- */

export function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function humanize(value: string): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function truncate(value: string, max = 60): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function getInitials(firstName?: string, lastName?: string, fallback = "?"): string {
  const f = firstName?.charAt(0) ?? "";
  const l = lastName?.charAt(0) ?? "";
  const initials = `${f}${l}`.toUpperCase();
  return initials || fallback;
}

export function getInitialsFromName(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/* ---------- Objects ---------- */

export function removeEmptyValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out as Partial<T>;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/* ---------- Arrays ---------- */

export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (pick(item) || 0), 0);
}

export function uniqueBy<T>(items: T[], key: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ---------- Tables / pagination ---------- */

export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function getPaginationRange(page: number, totalPages: number, siblingCount = 1): (number | "…")[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, totalPages);
  const showLeftDots = left > 2;
  const showRightDots = right < totalPages - 1;
  const range: (number | "…")[] = [];
  if (!showLeftDots && showRightDots) {
    for (let i = 1; i <= 3 + siblingCount * 2; i++) range.push(i);
    range.push("…", totalPages);
  } else if (showLeftDots && !showRightDots) {
    range.push(1, "…");
    for (let i = totalPages - (2 + siblingCount * 2); i <= totalPages; i++) range.push(i);
  } else {
    range.push(1, "…");
    for (let i = left; i <= right; i++) range.push(i);
    range.push("…", totalPages);
  }
  return range;
}

export function buildQueryParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((item) => search.append(k, String(item)));
    else search.append(k, String(v));
  }
  return search.toString();
}

/* ---------- Files ---------- */

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function isValidFileType(filename: string, allowed: readonly string[]): boolean {
  return allowed.includes(getFileExtension(filename));
}

export function getFileKind(filename: string): "document" | "spreadsheet" | "image" | "archive" | "other" {
  const ext = getFileExtension(filename);
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "document";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["zip", "rar", "7z"].includes(ext)) return "archive";
  return "other";
}

/* ---------- Export ---------- */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV<T extends Record<string, unknown>>(rows: T[], filename: string, columns?: { key: string; header: string }[]): void {
  if (rows.length === 0 && !columns) return;
  const headers = columns ? columns.map((c) => c.header) : Object.keys(rows[0]);
  const keys = columns ? columns.map((c) => c.key) : Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(keys.map((k) => escape(row[k])).join(","));
  downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function exportToExcel<T extends Record<string, unknown>>(rows: T[], filename: string): void {
  // Lightweight Excel-compatible export (TSV with .xls extension for max compat without deps)
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [headers.join("\t")];
  for (const row of rows) lines.push(headers.map((h) => String(row[h] ?? "")).join("\t"));
  downloadBlob(new Blob(["\uFEFF" + lines.join("\n")], { type: "application/vnd.ms-excel" }), filename.endsWith(".xls") ? filename : `${filename}.xls`);
}

export function exportToPDF(title: string, rowsHtml: string, filename: string): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;padding:32px;color:#111} h1{font-size:20px} table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f3f4f6}
  </style></head><body><h1>${title}</h1>${rowsHtml}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
  void filename;
}

export function printElement(title: string, html: string): void {
  exportToPDF(title, html, title);
}

/* ---------- Misc ---------- */

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 300): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
