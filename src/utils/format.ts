import { format, parseISO, isValid } from "date-fns";
import { DATE_FORMATS } from "@/constants/app";

/* ---------- Currency / Number ---------- */

let activeCurrency = "USD";

export function setActiveCurrency(code: string) {
  activeCurrency = code;
}

export function getActiveCurrency() {
  return activeCurrency;
}

export function formatCurrency(value: number, currency = activeCurrency, locale = "en-US"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatAmount(value: number, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency = activeCurrency): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 1 }).format(n);
  if (abs >= 1_000_000) return `${sign}${fmt(abs / 1_000_000)}M`.replace(/(\$|€|£)([\d.]+)M/, "$1$2M");
  if (abs >= 1_000) return `${sign}${fmt(abs / 1_000)}K`.replace(/(\$|€|£)([\d.]+)K/, "$1$2K");
  return fmt(value);
}

export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatNumber(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value >= 0 ? "" : ""}${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/* ---------- Date ---------- */

function toDate(input: string | Date): Date | null {
  if (input instanceof Date) return isValid(input) ? input : null;
  const d = parseISO(input);
  if (isValid(d)) return d;
  const fallback = new Date(input);
  return isValid(fallback) ? fallback : null;
}

export function formatDate(input: string | Date, pattern: string = DATE_FORMATS.DATE): string {
  const d = toDate(input);
  return d ? format(d, pattern) : "—";
}

export function formatDateTime(input: string | Date): string {
  const d = toDate(input);
  return d ? format(d, DATE_FORMATS.DATETIME) : "—";
}

export function formatTime(input: string | Date): string {
  const d = toDate(input);
  return d ? format(d, DATE_FORMATS.TIME) : "—";
}

export function formatRelative(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/* ---------- Phone / Files ---------- */

export function formatPhone(phone?: string): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return phone;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (!bytes || Number.isNaN(bytes)) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
