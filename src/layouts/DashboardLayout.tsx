import * as React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3, Bell, Boxes, Building2, ChevronDown, ChevronsLeft, ChevronsRight, ClipboardCheck,
  FileText, FolderOpen, HandCoins, LayoutDashboard, LogOut, Menu, Moon, Search, Settings,
  ShoppingBag, ShoppingCart, Sun, Users, UserCog, Wallet, CheckCheck, X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { PERMISSIONS, ROUTES, ROLE_LABELS } from "@/constants/app";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore, resolveTheme } from "@/stores/ui.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Avatar, Button, Input } from "@/components/ui/primitives";
import { formatRelative } from "@/utils/format";

interface NavChild { label: string; to: string; permission?: string }
interface NavItem { label: string; icon: React.ReactNode; to?: string; permission?: string; children?: NavChild[] }

const NAV: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, to: ROUTES.DASHBOARD, permission: PERMISSIONS.DASHBOARD_READ },
  {
    label: "CRM", icon: <Users className="h-[18px] w-[18px]" />, permission: PERMISSIONS.CUSTOMERS_READ,
    children: [
      { label: "Customers", to: ROUTES.CRM.CUSTOMERS, permission: PERMISSIONS.CUSTOMERS_READ },
      { label: "Contacts", to: ROUTES.CRM.CONTACTS, permission: PERMISSIONS.CUSTOMERS_READ },
      { label: "Leads", to: ROUTES.CRM.LEADS, permission: PERMISSIONS.LEADS_READ },
      { label: "Opportunities", to: ROUTES.CRM.OPPORTUNITIES, permission: PERMISSIONS.OPPORTUNITIES_READ },
    ],
  },
  {
    label: "Sales", icon: <ShoppingBag className="h-[18px] w-[18px]" />, permission: PERMISSIONS.SALES_READ,
    children: [
      { label: "Quotations", to: ROUTES.SALES.QUOTATIONS, permission: PERMISSIONS.SALES_READ },
      { label: "Sales Orders", to: ROUTES.SALES.ORDERS, permission: PERMISSIONS.SALES_READ },
      { label: "Deliveries", to: ROUTES.SALES.DELIVERIES, permission: PERMISSIONS.SALES_READ },
      { label: "Invoices", to: ROUTES.SALES.INVOICES, permission: PERMISSIONS.SALES_READ },
      { label: "Credit Notes", to: ROUTES.SALES.CREDIT_NOTES, permission: PERMISSIONS.SALES_READ },
      { label: "Payments", to: ROUTES.SALES.PAYMENTS, permission: PERMISSIONS.SALES_READ },
      { label: "Returns", to: ROUTES.SALES.RETURNS, permission: PERMISSIONS.SALES_READ },
    ],
  },
  {
    label: "Purchases", icon: <ShoppingCart className="h-[18px] w-[18px]" />, permission: PERMISSIONS.PURCHASES_READ,
    children: [
      { label: "Suppliers", to: ROUTES.PURCHASES.SUPPLIERS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Requests", to: ROUTES.PURCHASES.REQUESTS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Quotations", to: ROUTES.PURCHASES.QUOTATIONS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Orders", to: ROUTES.PURCHASES.ORDERS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Goods Receipts", to: ROUTES.PURCHASES.RECEIPTS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Supplier Invoices", to: ROUTES.PURCHASES.INVOICES, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Payments", to: ROUTES.PURCHASES.PAYMENTS, permission: PERMISSIONS.PURCHASES_READ },
      { label: "Returns", to: ROUTES.PURCHASES.RETURNS, permission: PERMISSIONS.PURCHASES_READ },
    ],
  },
  {
    label: "Inventory", icon: <Boxes className="h-[18px] w-[18px]" />, permission: PERMISSIONS.INVENTORY_READ,
    children: [
      { label: "Products", to: ROUTES.INVENTORY.PRODUCTS, permission: PERMISSIONS.PRODUCTS_READ },
      { label: "Categories", to: ROUTES.INVENTORY.CATEGORIES, permission: PERMISSIONS.PRODUCTS_READ },
      { label: "Warehouses", to: ROUTES.INVENTORY.WAREHOUSES, permission: PERMISSIONS.INVENTORY_READ },
      { label: "Movements", to: ROUTES.INVENTORY.MOVEMENTS, permission: PERMISSIONS.INVENTORY_READ },
      { label: "Transfers", to: ROUTES.INVENTORY.TRANSFERS, permission: PERMISSIONS.INVENTORY_TRANSFER },
      { label: "Adjustments", to: ROUTES.INVENTORY.ADJUSTMENTS, permission: PERMISSIONS.INVENTORY_ADJUST },
      { label: "Valuation", to: ROUTES.INVENTORY.VALUATION, permission: PERMISSIONS.INVENTORY_READ },
    ],
  },
  {
    label: "Accounting", icon: <Wallet className="h-[18px] w-[18px]" />, permission: PERMISSIONS.ACCOUNTING_READ,
    children: [
      { label: "Overview", to: ROUTES.ACCOUNTING.OVERVIEW, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Chart of Accounts", to: ROUTES.ACCOUNTING.CHART_OF_ACCOUNTS, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Journal Entries", to: ROUTES.ACCOUNTING.JOURNAL, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Receivables", to: ROUTES.ACCOUNTING.RECEIVABLES, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Payables", to: ROUTES.ACCOUNTING.PAYABLES, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Expenses", to: ROUTES.ACCOUNTING.EXPENSES, permission: PERMISSIONS.EXPENSES_READ },
      { label: "Taxes", to: ROUTES.ACCOUNTING.TAXES, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Profit & Loss", to: ROUTES.ACCOUNTING.PROFIT_LOSS, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Balance Sheet", to: ROUTES.ACCOUNTING.BALANCE_SHEET, permission: PERMISSIONS.ACCOUNTING_READ },
      { label: "Cash Flow", to: ROUTES.ACCOUNTING.CASH_FLOW, permission: PERMISSIONS.ACCOUNTING_READ },
    ],
  },
  {
    label: "HR", icon: <UserCog className="h-[18px] w-[18px]" />, permission: PERMISSIONS.EMPLOYEES_READ,
    children: [
      { label: "Employees", to: ROUTES.HR.EMPLOYEES, permission: PERMISSIONS.EMPLOYEES_READ },
      { label: "Departments", to: ROUTES.HR.DEPARTMENTS, permission: PERMISSIONS.EMPLOYEES_READ },
      { label: "Attendance", to: ROUTES.HR.ATTENDANCE, permission: PERMISSIONS.ATTENDANCE_READ },
      { label: "Leave Requests", to: ROUTES.HR.LEAVES, permission: PERMISSIONS.LEAVES_READ },
      { label: "Payroll", to: ROUTES.HR.PAYROLL, permission: PERMISSIONS.PAYROLL_READ },
      { label: "Evaluations", to: ROUTES.HR.EVALUATIONS, permission: PERMISSIONS.EMPLOYEES_READ },
    ],
  },
  {
    label: "Projects", icon: <ClipboardCheck className="h-[18px] w-[18px]" />, permission: PERMISSIONS.PROJECTS_READ,
    children: [
      { label: "All Projects", to: ROUTES.PROJECTS.LIST, permission: PERMISSIONS.PROJECTS_READ },
      { label: "Tasks", to: ROUTES.PROJECTS.TASKS, permission: PERMISSIONS.TASKS_READ },
      { label: "Milestones", to: ROUTES.PROJECTS.MILESTONES, permission: PERMISSIONS.PROJECTS_READ },
      { label: "Time Tracking", to: ROUTES.PROJECTS.TIME_TRACKING, permission: PERMISSIONS.PROJECTS_READ },
    ],
  },
  {
    label: "Assets", icon: <Building2 className="h-[18px] w-[18px]" />, permission: PERMISSIONS.ASSETS_READ,
    children: [
      { label: "All Assets", to: ROUTES.ASSETS.LIST, permission: PERMISSIONS.ASSETS_READ },
      { label: "Maintenance", to: ROUTES.ASSETS.MAINTENANCE, permission: PERMISSIONS.ASSETS_READ },
    ],
  },
  { label: "Documents", icon: <FolderOpen className="h-[18px] w-[18px]" />, to: ROUTES.DOCUMENTS, permission: PERMISSIONS.DOCUMENTS_READ },
  { label: "Reports", icon: <BarChart3 className="h-[18px] w-[18px]" />, to: ROUTES.REPORTS, permission: PERMISSIONS.REPORTS_READ },
  { label: "Approvals", icon: <HandCoins className="h-[18px] w-[18px]" />, to: ROUTES.APPROVALS, permission: PERMISSIONS.DASHBOARD_READ },
  { label: "Audit Logs", icon: <FileText className="h-[18px] w-[18px]" />, to: ROUTES.AUDIT_LOGS, permission: PERMISSIONS.AUDIT_READ },
  { label: "Settings", icon: <Settings className="h-[18px] w-[18px]" />, to: ROUTES.SETTINGS.ROOT, permission: PERMISSIONS.SETTINGS_READ },
];

function useCan(permission?: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!permission) return true;
  return !!user?.permissions.includes(permission);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<string[]>(["Sales"]);
  const user = useAuthStore((s) => s.user);

  const can = React.useCallback((p?: string) => !p || !!user?.permissions.includes(p), [user]);
  const visible = NAV.filter((n) => can(n.permission)).map((n) => ({
    ...n,
    children: n.children?.filter((c) => can(c.permission)),
  })).filter((n) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return n.label.toLowerCase().includes(q) || n.children?.some((c) => c.label.toLowerCase().includes(q));
  });

  const isActive = (item: NavItem) => {
    if (item.to) return location.pathname === item.to;
    return item.children?.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to + "/")) ?? false;
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-border px-4", collapsed && "justify-center px-2")}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">N</span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight">Nexora ERP</p>
            <p className="text-[11px] text-muted-foreground">Enterprise Suite v2.4</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules…" className="h-8 pl-8 text-xs" aria-label="Search navigation" />
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="Primary">
        {visible.map((item) => {
          const active = isActive(item);
          const open = expanded.includes(item.label) || (!!query && !!item.children);
          if (item.to && !item.children) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {!collapsed && item.label}
              </NavLink>
            );
          }
          return (
            <div key={item.label}>
              <button
                onClick={() => setExpanded((e) => (e.includes(item.label) ? e.filter((x) => x !== item.label) : [...e, item.label]))}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-expanded={open}
              >
                {item.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
                  </>
                )}
              </button>
              {open && !collapsed && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                  {item.children?.map((c) => {
                    const childActive = location.pathname === c.to || location.pathname.startsWith(c.to + "/");
                    return (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                          childActive ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {c.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold">Need help?</p>
            <p className="text-[11px] text-muted-foreground">Docs, shortcuts & support.</p>
            <Button variant="outline" size="xs" className="mt-2 w-full">Open help center</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarCollapsed, setSidebarCollapsed, setSidebarMobileOpen, theme, setTheme } = useUIStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteQuery, setPaletteQuery] = React.useState("");
  const notifRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const dark = resolveTheme(theme) === "dark";

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const paletteResults = React.useMemo(() => {
    const all: { label: string; to: string; group: string }[] = [];
    NAV.forEach((n) => {
      if (n.to) all.push({ label: n.label, to: n.to, group: "Modules" });
      n.children?.forEach((c) => all.push({ label: c.label, to: c.to, group: n.label }));
    });
    if (!paletteQuery) return all.slice(0, 9);
    return all.filter((r) => r.label.toLowerCase().includes(paletteQuery.toLowerCase())).slice(0, 9);
  }, [paletteQuery]);

  const sevColor: Record<string, string> = {
    info: "bg-sky-500", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setSidebarMobileOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon-sm" className="hidden lg:inline-flex" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {sidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
      </Button>

      <button
        onClick={() => setPaletteOpen(true)}
        className="hidden h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-[13px] text-muted-foreground hover:bg-muted md:flex md:max-w-md"
        aria-label="Global search"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search pages, customers, invoices…</span>
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
      </button>
      <div className="flex-1 md:hidden" />

      <Button variant="ghost" size="icon-sm" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
        {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <Button variant="ghost" size="icon-sm" onClick={() => setNotifOpen((o) => !o)} aria-label={`Notifications, ${unread} unread`}>
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>
          )}
        </Button>
        {notifOpen && (
          <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] rounded-xl border border-border bg-card shadow-2xl" role="menu" aria-label="Notifications">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markAsRead(n.id); setNotifOpen(false); if (n.link) navigate(n.link); }}
                  className={cn("flex w-full gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/50", !n.read && "bg-primary/[0.04]")}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", sevColor[n.severity])} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold">{n.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{n.message}</span>
                    <span className="block text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setNotifOpen(false); navigate(ROUTES.NOTIFICATIONS); }}>View all notifications</Button>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="relative" ref={userRef}>
        <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted" aria-label="User menu" aria-expanded={userOpen}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          <span className="hidden text-left xl:block">
            <span className="block text-[13px] font-semibold leading-tight">{user?.firstName} {user?.lastName}</span>
            <span className="block text-[11px] text-muted-foreground leading-tight">{ROLE_LABELS[(user?.role ?? "employee") as keyof typeof ROLE_LABELS]}</span>
          </span>
        </button>
        {userOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl" role="menu">
            <div className="px-3 py-2">
              <p className="text-[13px] font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="h-px bg-border my-1" />
            {[
              { label: "My profile", to: ROUTES.SETTINGS.PROFILE },
              { label: "Preferences", to: ROUTES.SETTINGS.NOTIFICATION_PREFS },
              { label: "Settings", to: ROUTES.SETTINGS.ROOT },
            ].map((i) => (
              <button key={i.label} onClick={() => { setUserOpen(false); navigate(i.to); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-muted">{i.label}</button>
            ))}
            <div className="h-px bg-border my-1" />
            <button onClick={() => { logout(); navigate(ROUTES.LOGIN); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] text-destructive hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Command palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPaletteOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type to search pages…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search pages"
              />
              <button onClick={() => setPaletteOpen(false)} aria-label="Close search"><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {paletteResults.map((r) => (
                <button
                  key={r.to + r.label}
                  onClick={() => { navigate(r.to); setPaletteOpen(false); setPaletteQuery(""); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-muted"
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground">{r.group}</span>
                </button>
              ))}
              {paletteResults.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">No results for “{paletteQuery}”.</p>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function DashboardLayout() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const setMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card transition-all duration-200 lg:block", collapsed ? "w-[68px]" : "w-[264px]")} aria-label="Sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-card shadow-2xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[264px]")}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]" id="main-content">
          <Outlet />
        </main>
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground lg:text-left">
          <span className="font-semibold text-foreground">Nexora ERP</span> v2.4.0 · © 2026 Nexora Industries · All systems operational
        </footer>
      </div>
    </div>
  );
}

export { useCan };
