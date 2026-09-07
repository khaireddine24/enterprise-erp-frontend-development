import * as React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Building2, Globe, Lock, Palette, ShieldCheck, User, Users } from "lucide-react";
import { PERMISSIONS, ROLE_LABELS, ROLES, ROUTES } from "@/constants/app";
import { getPermissionsForRole } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { useDocumentTitle, usePermissions } from "@/hooks/core";
import { useEmployees } from "@/hooks/queries";
import { Avatar, Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Select, Switch, Tabs } from "@/components/ui/primitives";
import { DetailGrid, EntityCell, PageContainer, PageHeader, PermissionDenied, StatusBadge } from "@/components/common/feedback";
import { toast } from "@/stores/toast.store";
import { setActiveCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import { humanize } from "@/utils/helpers";

const TABS = [
  { to: ROUTES.SETTINGS.COMPANY, label: "Company", icon: <Building2 className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.PROFILE, label: "Profile", icon: <User className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.USERS, label: "Users", icon: <Users className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.ROLES, label: "Roles & Permissions", icon: <ShieldCheck className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.ERP, label: "ERP Preferences", icon: <Palette className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.SECURITY, label: "Security", icon: <Lock className="h-4 w-4" /> },
  { to: ROUTES.SETTINGS.NOTIFICATION_PREFS, label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

export function SettingsLayout() {
  useDocumentTitle("Settings");
  const { can } = usePermissions();
  if (!can(PERMISSIONS.SETTINGS_READ)) {
    return <PageContainer><PermissionDenied module="settings" /></PageContainer>;
  }
  return (
    <PageContainer>
      <PageHeader title="Settings" description="Workspace configuration, access control and preferences." breadcrumbs={[{ label: "Settings" }]} />
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-0.5 pt-4">
            {TABS.map((t) => (
              <NavLink key={t.to} to={t.to} className={({ isActive }) => cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                {t.icon}{t.label}
              </NavLink>
            ))}
          </CardContent>
        </Card>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </PageContainer>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button onClick={() => { onSave(); toast("Settings saved", { message: "Your changes are now live." }); }}>Save changes</Button>
    </div>
  );
}

export function CompanySettingsPage() {
  const [form, setForm] = React.useState({
    name: "Nexora Industries Inc.", email: "finance@nexora.example", phone: "+1 (415) 555-0132",
    taxId: "US-84-2091741", address: "548 Market Street, San Francisco, CA 94104",
    website: "https://nexora.example", fiscalStart: "January", currency: "USD",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Company profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Legal name" required><Input value={form.name} onChange={set("name")} /></FormField>
          <FormField label="Tax ID" required><Input value={form.taxId} onChange={set("taxId")} /></FormField>
          <FormField label="Email"><Input value={form.email} onChange={set("email")} /></FormField>
          <FormField label="Phone"><Input value={form.phone} onChange={set("phone")} /></FormField>
          <FormField label="Address" className="sm:col-span-2"><Input value={form.address} onChange={set("address")} /></FormField>
          <FormField label="Website"><Input value={form.website} onChange={set("website")} /></FormField>
          <FormField label="Fiscal year starts"><Select value={form.fiscalStart} onChange={set("fiscalStart")} options={["January", "April", "July", "October"].map((m) => ({ label: m, value: m }))} /></FormField>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">N</span>
          <div>
            <Button variant="outline" size="sm" onClick={() => toast("Logo uploaded", { message: "Company logo updated.", variant: "info" })}>Upload logo</Button>
            <p className="mt-1 text-xs text-muted-foreground">PNG or SVG, min 256×256. Used on invoices and reports.</p>
          </div>
        </CardContent>
      </Card>
      <SaveBar onSave={() => undefined} />
    </div>
  );
}

export function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = React.useState({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: user?.phone ?? "", department: user?.department ?? "", position: user?.position ?? "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={`${form.firstName} ${form.lastName}`} size="lg" />
            <Button variant="outline" size="sm" onClick={() => toast("Photo uploaded", { variant: "info" })}>Change photo</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name"><Input value={form.firstName} onChange={set("firstName")} /></FormField>
            <FormField label="Last name"><Input value={form.lastName} onChange={set("lastName")} /></FormField>
            <FormField label="Email"><Input value={user?.email ?? ""} disabled /></FormField>
            <FormField label="Phone"><Input value={form.phone} onChange={set("phone")} /></FormField>
            <FormField label="Department"><Input value={form.department} onChange={set("department")} /></FormField>
            <FormField label="Position"><Input value={form.position} onChange={set("position")} /></FormField>
          </div>
          <SaveBar onSave={() => { if (user) setUser({ ...user, ...form }); }} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FormField label="Current password"><Input type="password" placeholder="••••••••" /></FormField>
          <FormField label="New password"><Input type="password" placeholder="Min. 8 characters" /></FormField>
          <FormField label="Confirm"><Input type="password" placeholder="Repeat password" /></FormField>
          <div className="sm:col-span-3"><SaveBar onSave={() => undefined} /></div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UsersSettingsPage() {
  const emps = useEmployees({ page: 1, pageSize: 10 });
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.USERS_MANAGE);
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Users</CardTitle>{canManage && <Button size="sm" onClick={() => toast("Invite sent", { message: "User invitation email sent." })}>Invite user</Button>}</CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {((emps.data?.data ?? []) as Record<string, unknown>[]).map((e) => (
              <li key={String(e.id)} className="flex items-center justify-between gap-3 py-2.5">
                <EntityCell name={`${e.firstName} ${e.lastName}`} sub={String(e.email)} />
                <span className="flex items-center gap-2">
                  <span className="hidden text-xs text-muted-foreground sm:block">{String(e.department)}</span>
                  <StatusBadge status={String(e.status)} />
                  {canManage && <Button variant="ghost" size="xs" onClick={() => toast("User updated", { message: "Role assignment saved.", variant: "info" })}>Edit</Button>}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {!canManage && <p className="text-xs text-muted-foreground">You need the <code>users.manage</code> permission to invite or edit users.</p>}
    </div>
  );
}

export function RolesSettingsPage() {
  const [role, setRole] = React.useState<string>(ROLES.SALES_MANAGER);
  const perms = getPermissionsForRole(role);
  const groups = React.useMemo(() => {
    const map = new Map<string, string[]>();
    perms.forEach((p) => {
      const [mod] = p.split(".");
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)?.push(p);
    });
    return [...map.entries()];
  }, [perms]);
  const { can } = usePermissions();
  const switchRole = useAuthStore((s) => s.switchRole);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Roles</CardTitle><span className="text-xs text-muted-foreground">{perms.length} permissions</span></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((k) => (
            <button key={k} onClick={() => setRole(ROLES[k])} className={cn("rounded-lg border px-3 py-1.5 text-[13px] font-medium", role === ROLES[k] ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
              {ROLE_LABELS[ROLES[k]]}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Permissions — {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {groups.map(([mod, list]) => (
            <div key={mod} className="rounded-lg border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{mod}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {list.map((p) => (
                  <span key={p} className="rounded-md bg-muted px-2 py-1 font-mono text-[11px]">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Try a role (demo)</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <p className="w-full text-[13px] text-muted-foreground">Instantly switch your session role to preview permission gating across the ERP.</p>
          {(Object.keys(ROLES) as (keyof typeof ROLES)[]).slice(0, 6).map((k) => (
            <Button key={k} variant="outline" size="sm" onClick={() => { switchRole(ROLES[k]); toast("Role switched", { message: `Now acting as ${ROLE_LABELS[ROLES[k]]}.`, variant: "info" }); }}>
              {ROLE_LABELS[ROLES[k]]}
            </Button>
          ))}
          {!can(PERMISSIONS.ROLES_MANAGE) && <p className="w-full text-xs text-muted-foreground">Editing roles requires <code>roles.manage</code>.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function ErpSettingsPage() {
  const { currency, locale, theme, setCurrency, setLocale, setTheme } = useUIStore();
  const [tab, setTab] = React.useState("general");
  return (
    <div className="space-y-5">
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "general", label: "General" }, { value: "locale", label: "Locale & Format" }, { value: "invoice", label: "Invoice" }, { value: "tax", label: "Tax" }]} />
      {tab === "general" && (
        <Card><CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <FormField label="Theme"><Select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")} options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "System", value: "system" }]} /></FormField>
          <FormField label="Default warehouse"><Select defaultValue="WH-East" options={[{ label: "WH-East", value: "WH-East" }, { label: "WH-West", value: "WH-West" }, { label: "WH-Central", value: "WH-Central" }]} /></FormField>
          <FormField label="Low-stock alert threshold"><Input type="number" defaultValue={10} /></FormField>
          <FormField label="Invoice payment terms"><Select defaultValue="net30" options={[{ label: "Net 15", value: "net15" }, { label: "Net 30", value: "net30" }, { label: "Net 60", value: "net60" }]} /></FormField>
        </CardContent></Card>
      )}
      {tab === "locale" && (
        <Card><CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <FormField label="Language"><Select value={locale} onChange={(e) => setLocale(e.target.value)} options={[{ label: "English", value: "en" }, { label: "Français", value: "fr" }, { label: "العربية (RTL)", value: "ar" }]} /></FormField>
          <FormField label="Currency"><Select value={currency} onChange={(e) => { setCurrency(e.target.value); setActiveCurrency(e.target.value); }} options={[{ label: "USD — US Dollar", value: "USD" }, { label: "EUR — Euro", value: "EUR" }, { label: "GBP — British Pound", value: "GBP" }, { label: "AED — UAE Dirham", value: "AED" }, { label: "SAR — Saudi Riyal", value: "SAR" }]} /></FormField>
          <FormField label="Timezone"><Select defaultValue="UTC" options={[{ label: "UTC", value: "UTC" }, { label: "America/New_York", value: "America/New_York" }, { label: "Europe/Paris", value: "Europe/Paris" }, { label: "Asia/Dubai", value: "Asia/Dubai" }]} /></FormField>
          <FormField label="Date format"><Select defaultValue="mdy" options={[{ label: "MMM d, yyyy", value: "mdy" }, { label: "dd/MM/yyyy", value: "dmy" }, { label: "yyyy-MM-dd", value: "iso" }]} /></FormField>
          <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2"><Globe className="h-4 w-4" /> Arabic enables right-to-left layout across the workspace.</p>
        </CardContent></Card>
      )}
      {tab === "invoice" && (
        <Card><CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <FormField label="Number prefix"><Input defaultValue="INV-2026-" /></FormField>
          <FormField label="Next number"><Input type="number" defaultValue={1862} /></FormField>
          <FormField label="Default tax"><Select defaultValue="VAT-15" options={[{ label: "VAT 15%", value: "VAT-15" }, { label: "VAT 5%", value: "VAT-05" }, { label: "Zero-rated", value: "VAT-00" }]} /></FormField>
          <FormField label="Footer note"><Input defaultValue="Thank you for your business." /></FormField>
        </CardContent></Card>
      )}
      {tab === "tax" && (
        <Card><CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <FormField label="Tax identification"><Input defaultValue="US-84-2091741" /></FormField>
          <FormField label="Default rate"><Select defaultValue="15" options={[{ label: "15%", value: "15" }, { label: "5%", value: "5" }, { label: "0%", value: "0" }]} /></FormField>
          <FormField label="Prices entered"><Select defaultValue="exclusive" options={[{ label: "Tax exclusive", value: "exclusive" }, { label: "Tax inclusive", value: "inclusive" }]} /></FormField>
        </CardContent></Card>
      )}
      <SaveBar onSave={() => undefined} />
    </div>
  );
}

export function SecuritySettingsPage() {
  const [twoFA, setTwoFA] = React.useState(false);
  const [sso, setSSO] = React.useState(true);
  const [expiry, setExpiry] = React.useState(true);
  const sessions = [
    { device: "MacBook Pro — Chrome", ip: "196.168.1.42", location: "San Francisco, US", current: true, last: "Now" },
    { device: "iPhone 15 — Safari", ip: "196.168.1.88", location: "San Francisco, US", current: false, last: "2h ago" },
    { device: "Windows — Edge", ip: "196.168.1.103", location: "New York, US", current: false, last: "Yesterday" },
  ];
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Login security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Two-factor authentication", desc: "Require authenticator codes for all users", value: twoFA, set: setTwoFA },
            { label: "Single sign-on (SSO)", desc: "Allow Google / Microsoft workspace login", value: sso, set: setSSO },
            { label: "Session expiration", desc: "Sign out inactive sessions after 8 hours", value: expiry, set: setExpiry },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-semibold">{r.label}</p><p className="text-xs text-muted-foreground">{r.desc}</p></div>
              <Switch checked={r.value} onChange={r.set} label={r.label} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Active sessions</CardTitle><Button variant="outline" size="sm" onClick={() => toast("Sessions revoked", { message: "All other sessions signed out.", variant: "info" })}>Revoke others</Button></CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {sessions.map((s) => (
              <li key={s.device} className="flex items-center justify-between py-2.5 text-sm">
                <div><p className="font-semibold">{s.device} {s.current && <span className="ml-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">CURRENT</span>}</p><p className="text-xs text-muted-foreground">{s.ip} · {s.location} · {s.last}</p></div>
                {!s.current && <Button variant="ghost" size="xs" onClick={() => toast("Session revoked", { variant: "info" })}>Revoke</Button>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Audit logs</CardTitle><Link to={ROUTES.AUDIT_LOGS} className="text-xs font-medium text-primary hover:underline">Open full log →</Link></CardHeader>
        <CardContent><DetailGrid items={[{ label: "Retention", value: "7 years" }, { label: "Events (30d)", value: "12,480" }, { label: "Export", value: "CSV / PDF" }]} /></CardContent>
      </Card>
    </div>
  );
}

export function NotificationPrefsPage() {
  const [prefs, setPrefs] = React.useState<Record<string, { email: boolean; push: boolean; sms: boolean }>>({
    invoice_created: { email: true, push: true, sms: false },
    payment_received: { email: true, push: true, sms: false },
    low_stock: { email: true, push: true, sms: true },
    leave_request: { email: true, push: true, sms: false },
    approval_request: { email: true, push: true, sms: true },
    task_assigned: { email: false, push: true, sms: false },
    deadline_approaching: { email: true, push: true, sms: false },
    system: { email: false, push: true, sms: false },
  });
  const toggle = (type: string, channel: "email" | "push" | "sms") =>
    setPrefs((p) => ({ ...p, [type]: { ...p[type], [channel]: !p[type][channel] } }));
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Notification preferences</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Event</th><th className="py-2 pr-4 text-center">Email</th><th className="py-2 pr-4 text-center">Push</th><th className="py-2 text-center">SMS</th></tr></thead>
              <tbody>
                {Object.entries(prefs).map(([type, ch]) => (
                  <tr key={type} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{humanize(type)}</td>
                    {(["email", "push", "sms"] as const).map((c) => (
                      <td key={c} className="py-2.5 text-center">
                        <Switch checked={ch[c]} onChange={() => toggle(type, c)} label={`${type} ${c}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <SaveBar onSave={() => undefined} />
    </div>
  );
}

export function SettingsIndexRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(ROUTES.SETTINGS.COMPANY, { replace: true });
  }, [navigate]);
  return null;
}
