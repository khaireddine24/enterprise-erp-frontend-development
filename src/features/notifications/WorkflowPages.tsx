import * as React from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QUERY_KEYS } from "@/constants/app";
import { useApprovals, useAuditLogs } from "@/hooks/queries";
import { useDocumentTitle, useTableParams } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle, Tabs } from "@/components/ui/primitives";
import { DataTable } from "@/components/common/DataTable";
import { ApprovalTimeline, EmptyState, EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "@/stores/toast.store";
import { cn } from "@/utils/cn";
import { exportToCSV } from "@/utils/helpers";
import { formatCurrency, formatDate, formatDateTime, formatRelative } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;

/* ================= Notifications ================= */
export function NotificationsPage() {
  useDocumentTitle("Notifications");
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const remove = useNotificationStore((s) => s.remove);
  const [filter, setFilter] = React.useState("all");

  const sevStyles: Record<string, string> = {
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const list = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });
  const types = [...new Set(notifications.map((n) => n.type))];

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description={`${notifications.filter((n) => !n.read).length} unread · Stay on top of approvals, payments and alerts.`}
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => { markAllAsRead(); toast("All caught up", { message: "Every notification is marked as read.", variant: "info" }); }}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />
      <Tabs value={filter} onChange={setFilter} tabs={[
        { value: "all", label: "All", count: notifications.length },
        { value: "unread", label: "Unread", count: notifications.filter((n) => !n.read).length },
        ...types.slice(0, 5).map((t) => ({ value: t, label: humanize(t) })),
      ]} />
      <Card>
        <CardContent className="pt-2">
          {list.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up. New alerts will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {list.map((n) => (
                <li key={n.id} className={cn("flex items-start gap-3 py-3.5", !n.read && "rounded-lg bg-primary/[0.04] px-2 -mx-2")}>
                  <span className={cn("rounded-xl p-2.5", sevStyles[n.severity])}><Bell className="h-4 w-4" /></span>
                  <button className="min-w-0 flex-1 text-left" onClick={() => { markAsRead(n.id); if (n.link) navigate(n.link); }}>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-[13px] text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{humanize(n.type)} · {formatRelative(n.createdAt)}</p>
                  </button>
                  {!n.read && <Badge variant="info">New</Badge>}
                  <Button variant="ghost" size="icon-sm" onClick={() => remove(n.id)} aria-label="Dismiss notification"><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

/* ================= Approvals ================= */
export function ApprovalsPage() {
  useDocumentTitle("Approval Center");
  const q = useApprovals({ page: 1, pageSize: 50 });
  const [tab, setTab] = React.useState("pending");
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [comment, setComment] = React.useState("");

  const rows = ((q.data?.data ?? []) as Row[]);
  const filtered = rows.filter((r) => (tab === "all" ? true : tab === "pending" ? ["pending", "changes_requested"].includes(String(r.status)) : String(r.status) === tab));
  const counts = {
    pending: rows.filter((r) => ["pending", "changes_requested"].includes(String(r.status))).length,
    approved: rows.filter((r) => String(r.status) === "approved").length,
    rejected: rows.filter((r) => String(r.status) === "rejected").length,
  };

  const decide = (action: "approved" | "rejected" | "changes_requested") => {
    if (!selected) return;
    toast(
      action === "approved" ? "Approved" : action === "rejected" ? "Rejected" : "Changes requested",
      { message: `${String(selected.reference)} — ${comment || "no comment"}.`, variant: action === "approved" ? "success" : "info" }
    );
    setSelected(null);
    setComment("");
  };

  return (
    <PageContainer>
      <PageHeader title="Approval Center" description="One inbox for purchase orders, leaves, expenses and invoices." breadcrumbs={[{ label: "Approvals" }]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting decision" value={String(counts.pending)} tone="warning" />
        <StatCard label="Approved" value={String(counts.approved)} tone="success" />
        <StatCard label="Rejected" value={String(counts.rejected)} tone="danger" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: "pending", label: "Pending", count: counts.pending },
        { value: "approved", label: "Approved", count: counts.approved },
        { value: "rejected", label: "Rejected", count: counts.rejected },
        { value: "all", label: "All", count: rows.length },
      ]} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-2">
            {filtered.length === 0 ? (
              <EmptyState title="Nothing here" description="No approval requests in this state." />
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((r) => (
                  <li key={String(r.id)}>
                    <button onClick={() => setSelected(r)} className={cn("flex w-full items-center justify-between gap-3 py-3 text-left", selected && String(selected.id) === String(r.id) && "rounded-lg bg-primary/5 px-2 -mx-2")}>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={String(r.requester)} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{String(r.title)}</p>
                          <p className="text-xs text-muted-foreground">{String(r.type)} · {String(r.reference)} · {String(r.requester)}</p>
                        </div>
                      </div>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {r.amount !== undefined && <span className="text-[13px] font-bold">{formatCurrency(Number(r.amount))}</span>}
                        <StatusBadge status={String(r.status)} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader><CardTitle>Decision panel</CardTitle></CardHeader>
          <CardContent>
            {!selected ? (
              <EmptyState title="Select a request" description="Choose an item from the inbox to review details and decide." />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold">{String(selected.title)}</p>
                  <p className="text-xs text-muted-foreground">{String(selected.type)} · {String(selected.reference)} · submitted {formatRelative(String(selected.submittedAt))}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-[13px]">
                  <p className="text-xs text-muted-foreground">Current step</p>
                  <p className="font-bold">{String(selected.currentStep)}</p>
                </div>
                <ApprovalTimeline steps={(selected.history as { step: string; by: string; action: string; at: string; comment?: string }[]).map((h) => ({ ...h, at: formatRelative(h.at) }))} />
                {(String(selected.status) === "pending" || String(selected.status) === "changes_requested") && (
                  <>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment (optional)…" rows={2} className="w-full rounded-lg border border-input bg-card p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Approval comment" />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => decide("approved")}><Check className="h-4 w-4" /> Approve</Button>
                      <Button variant="outline" size="sm" onClick={() => decide("changes_requested")}>Request changes</Button>
                      <Button variant="danger" size="sm" onClick={() => decide("rejected")}><X className="h-4 w-4" /> Reject</Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

/* ================= Audit logs ================= */
export function AuditLogsPage() {
  useDocumentTitle("Audit Logs");
  const { page, search, sortBy, sortDir, setPage, setSearch, setSorting } = useTableParams("date");
  const q = useAuditLogs({ page, pageSize: 15, search, sortBy, sortDir } as ListParams);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="Immutable trail of who changed what, when and from where."
        breadcrumbs={[{ label: "Audit Logs" }]}
        actions={<Button variant="outline" size="sm" onClick={() => exportToCSV(((q.data?.data ?? []) as Record<string, unknown>[]), "audit-logs")}>Export logs</Button>}
      />
      <DataTable<Row>
        columns={[
          { key: "date", header: "Date", sortable: true, accessor: (r) => <span className="whitespace-nowrap">{formatDateTime(String(r.date))}</span> },
          { key: "user", header: "User", accessor: (r) => <EntityCell name={String(r.user)} sub={String(r.ip)} /> },
          { key: "action", header: "Action", accessor: (r) => <StatusBadge status={r.action === "deleted" ? "rejected" : r.action === "created" ? "completed" : r.action === "approved" ? "approved" : "review"} /> },
          { key: "module", header: "Module", accessor: (r) => <Badge variant="secondary">{humanize(String(r.module))}</Badge> },
          { key: "entity", header: "Entity", accessor: (r) => `${r.entity} · ${r.entityId}` },
          { key: "details", header: "Details", accessor: (r) => <span className="text-muted-foreground">{String(r.details)}</span> },
        ]}
        query={{ data: q.data as never, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch() }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search user, module, entity…"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={setSorting}
        page={page}
        onPage={setPage}
        exportFilename="audit-logs"
      />
      <p className="hidden">{QUERY_KEYS.auditLogs} {formatDate(new Date().toISOString())}</p>
    </PageContainer>
  );
}
