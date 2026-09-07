import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiError, ListParams, PaginatedResponse } from "@/types";
import { STORAGE_KEYS } from "@/constants/app";

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "/api";
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string) !== "false"; // mock-first demo

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.session?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Session expired — clear auth, redirect handled by router guard
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state = { ...parsed.state, session: null, user: null, isAuthenticated: false };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
      } catch {
        /* ignore */
      }
      if (window.location.pathname !== "/login") window.location.href = "/login?expired=1";
    }
    return Promise.reject(normalizeError(error));
  }
);

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; code?: string; errors?: Record<string, string[]> } | undefined;
    return {
      message: data?.message || error.message || "Request failed",
      code: data?.code,
      status: error.response?.status,
      errors: data?.errors,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "An unexpected error occurred" };
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<T>(url, body, config);
  return res.data;
}

export async function apiPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<T>(url, body, config);
  return res.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

/* ---------- Mock transport (swap with real API by flipping VITE_USE_MOCK) ---------- */

export function isMockEnabled() {
  return USE_MOCK;
}

export function paginate<T>(items: T[], params: ListParams): PaginatedResponse<T> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  let filtered = items;

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((row) =>
      Object.values(row as Record<string, unknown>).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
    );
  }
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
      filtered = filtered.filter((row) => {
        const v = (row as Record<string, unknown>)[key];
        if (Array.isArray(value)) return value.includes(String(v));
        return String(v) === String(value);
      });
    }
  }
  if (params.sortBy) {
    const dir = params.sortDir === "desc" ? -1 : 1;
    const key = params.sortBy;
    filtered = [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[key];
      const bv = (b as Record<string, unknown>)[key];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return String(av) > String(bv) ? dir : -dir;
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
