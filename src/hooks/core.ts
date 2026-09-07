import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { hasAnyPermission, hasPermission as checkPermission } from "@/lib/permissions";
import { PAGINATION } from "@/constants/app";

/* ---------- Auth / permissions ---------- */

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { user, isAuthenticated, isLoading, login, logout };
}

export function useUser() {
  return useAuthStore((s) => s.user);
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const can = useCallback((permission: string) => checkPermission(user?.permissions, permission), [user]);
  const canAny = useCallback((permissions: string[]) => hasAnyPermission(user?.permissions, permissions), [user]);
  return { permissions: user?.permissions ?? [], can, canAny, role: user?.role };
}

export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  return checkPermission(user?.permissions, permission);
}

export function useRole(): string | undefined {
  return useAuthStore((s) => s.user?.role);
}

/* ---------- Debounce / search ---------- */

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useSearch(initial = "") {
  const [search, setSearch] = useState(initial);
  const debouncedSearch = useDebounce(search, 350);
  return { search, setSearch, debouncedSearch };
}

/* ---------- URL-synced table state ---------- */

export function useTableParams(defaultSort = "createdAt") {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || PAGINATION.DEFAULT_PAGE);
  const pageSize = Number(params.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);
  const search = params.get("search") || "";
  const sortBy = params.get("sortBy") || defaultSort;
  const sortDir = (params.get("sortDir") as "asc" | "desc") || "desc";

  const update = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "" || (k === "page" && Number(v) === 1)) next.delete(k);
        else next.set(k, String(v));
      }
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const setPage = useCallback((p: number) => update({ page: p }), [update]);
  const setSearch = useCallback((s: string) => update({ search: s || undefined, page: 1 }), [update]);
  const setSorting = useCallback((col: string) => {
    if (sortBy === col) update({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    else update({ sortBy: col, sortDir: "asc" });
  }, [sortBy, sortDir, update]);

  return { page, pageSize, search, sortBy, sortDir, setPage, setSearch, setSorting, update, params };
}

/* ---------- Modal / confirm ---------- */

export function useModal<T = unknown>() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<T | null>(null);
  const show = useCallback((p?: T) => {
    setPayload(p ?? null);
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    setPayload(null);
  }, []);
  return { open, payload, show, hide, setOpen };
}

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; title: string; message: string; resolve: ((v: boolean) => void) | null }>({
    open: false,
    title: "",
    message: "",
    resolve: null,
  });
  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => setState({ open: true, title, message, resolve }));
  }, []);
  const decide = useCallback(
    (v: boolean) => {
      state.resolve?.(v);
      setState((s) => ({ ...s, open: false, resolve: null }));
    },
    [state]
  );
  return { ...state, confirm, decide };
}

/* ---------- Media / storage / misc ---------- */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 1023px)");
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const update = useCallback(
    (v: T | ((p: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key]
  );
  return [value, update];
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Nexora ERP`;
  }, [title]);
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
