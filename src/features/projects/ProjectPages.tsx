import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, KanbanSquare, List as ListIcon, Plus } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import { useMilestones, useProject, useProjects, useTasks } from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress, Segmented, Tabs } from "@/components/ui/primitives";
import { DataTable } from "@/components/common/DataTable";
import { DetailGrid, EntityCell, PageContainer, PageHeader, PriorityBadge, StatCard, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatCurrency, formatDate } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;
const P = PERMISSIONS;

const projectFields: FieldConfig[] = [
  { name: "name", label: "Project name", type: "text", required: true, fullWidth: true },
  { name: "client", label: "Client", type: "text", required: true },
  { name: "manager", label: "Project manager", type: "text" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "endDate", label: "End date", type: "date" },
  { name: "budget", label: "Budget", type: "currency", min: 0 },
  { name: "priority", label: "Priority", type: "select", options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" }] },
];

export function ProjectsPage() {
  useDocumentTitle("Projects");
  const navigate = useNavigate();
  const q = useProjects({ page: 1, pageSize: 20 });
  const [view, setView] = React.useState("cards");

  return (
    <PageContainer>
      <PageHeader
        title="Projects" description="Delivery portfolio with budget and progress tracking."
        breadcrumbs={[{ label: "Projects" }]}
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "cards", label: "Cards" }, { value: "list", label: "List" }]} />
            <Button size="sm" onClick={() => toast("Project created", { message: "New project workspace is ready." })}><Plus className="h-4 w-4" /> New project</Button>
          </>
        }
      />
      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {((q.data?.data ?? []) as Row[]).map((p) => (
            <Card key={String(p.id)} className="cursor-pointer transition-colors hover:border-primary/50" onClick={() => navigate(`/projects/${p.id}`)}>
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle className="truncate">{String(p.name)}</CardTitle>
                  <p className="text-xs text-muted-foreground">{String(p.code)} · {String(p.client)}</p>
                </div>
                <PriorityBadge priority={String(p.priority)} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-bold">{Number(p.progress)}%</span></div>
                  <Progress value={Number(p.progress)} className="mt-1.5" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{String(p.tasksDone)}/{String(p.tasksTotal)} tasks</span>
                  <span>{formatCurrency(Number(p.spent))} / {formatCurrency(Number(p.budget))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs"><Avatar name={String(p.manager)} size="xs" />{String(p.manager)}</span>
                  <StatusBadge status={String(p.status)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable<Row>
          columns={[
            { key: "name", header: "Project", accessor: (r) => <EntityCell name={String(r.name)} sub={`${r.code} · ${r.client}`} /> },
            { key: "manager", header: "Manager" },
            { key: "progress", header: "Progress", accessor: (r) => <span className="flex items-center gap-2"><Progress value={Number(r.progress)} className="w-24" />{Number(r.progress)}%</span> },
            { key: "budget", header: "Budget", align: "right", accessor: (r) => formatCurrency(Number(r.budget)) },
            { key: "endDate", header: "Deadline", accessor: (r) => formatDate(String(r.endDate)) },
            { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
          ]}
          query={{ data: q.data as never, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch() }}
          exportFilename="projects"
          onRowClick={(r) => navigate(`/projects/${r.id}`)}
        />
      )}
    </PageContainer>
  );
}

export function ProjectDetailsPage() {
  const { id } = useParams();
  const { data } = useProject(id);
  const [tab, setTab] = React.useState("overview");
  useDocumentTitle(data ? String(data.name) : "Project");
  const p = data as Row | undefined;
  const tasks = useTasks({ page: 1, pageSize: 100, search: "", filters: { projectId: id } });

  if (!p) {
    return <PageContainer><div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div></PageContainer>;
  }

  const budgetPct = Math.round((Number(p.spent) / Math.max(1, Number(p.budget))) * 100);

  return (
    <PageContainer>
      <PageHeader
        title={String(p.name)}
        description={`${p.code} · ${p.client} · Managed by ${p.manager}`}
        breadcrumbs={[{ label: "Projects", to: ROUTES.PROJECTS.LIST }, { label: String(p.name) }]}
        actions={<><StatusBadge status={String(p.status)} /><PriorityBadge priority={String(p.priority)} /><Button size="sm" onClick={() => toast("Task created", { message: "New task added to this project." })}><Plus className="h-4 w-4" /> Add task</Button></>}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Progress" value={`${p.progress}%`} />
        <StatCard label="Budget used" value={`${budgetPct}%`} tone={budgetPct > 90 ? "danger" : "success"} />
        <StatCard label="Spent" value={formatCurrency(Number(p.spent))} />
        <StatCard label="Team" value={`${p.members} members`} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: "overview", label: "Overview" },
        { value: "tasks", label: "Tasks", count: tasks.data?.total ?? 0 },
        { value: "members", label: "Team" },
        { value: "budget", label: "Budget" },
      ]} />
      {tab === "overview" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "Client", value: String(p.client) },
          { label: "Manager", value: String(p.manager) },
          { label: "Start date", value: formatDate(String(p.startDate)) },
          { label: "End date", value: formatDate(String(p.endDate)) },
          { label: "Tasks", value: `${p.tasksDone} / ${p.tasksTotal} completed` },
          { label: "Health", value: budgetPct > 90 ? "At risk" : "On track" },
        ]} /></CardContent></Card>
      )}
      {tab === "tasks" && (
        <Card><CardContent className="pt-5">
          <ul className="divide-y divide-border">
            {((tasks.data?.data ?? []) as Row[]).map((t) => (
              <li key={String(t.id)} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{String(t.title)}</span><span className="text-xs text-muted-foreground">{String(t.assignee)} · due {formatDate(String(t.dueDate))}</span></span>
                <span className="flex shrink-0 items-center gap-2"><PriorityBadge priority={String(t.priority)} /><StatusBadge status={String(t.status)} /></span>
              </li>
            ))}
          </ul>
        </CardContent></Card>
      )}
      {tab === "members" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Ava Stone — PM", "Liam Carter — Dev", "Maya Chen — Design", "Noah Benali — QA", "Sofia Rossi — DevOps", "Ethan Wright — BA"].slice(0, Number(p.members)).map((m) => (
            <div key={m} className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
              <Avatar name={m} /><div><p className="text-sm font-semibold">{m.split(" — ")[0]}</p><p className="text-xs text-muted-foreground">{m.split(" — ")[1]}</p></div>
            </div>
          ))}
        </div>
      )}
      {tab === "budget" && (
        <Card><CardContent className="space-y-3 pt-5">
          {[["Labor", Number(p.spent) * 0.6], ["Materials", Number(p.spent) * 0.25], ["Other", Number(p.spent) * 0.15]].map(([k, v]) => (
            <div key={k as string} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
              <span>{k as string}</span><span className="font-bold">{formatCurrency(Number(v))}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-bold">
            <span>Remaining</span><span>{formatCurrency(Number(p.budget) - Number(p.spent))}</span>
          </div>
        </CardContent></Card>
      )}
    </PageContainer>
  );
}

const KANBAN_COLS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
  { id: "blocked", label: "Blocked" },
];

export function TasksPage() {
  useDocumentTitle("Tasks");
  const [view, setView] = React.useState<"kanban" | "list" | "calendar">("kanban");
  const q = useTasks({ page: 1, pageSize: 100 });
  const rows = ((q.data?.data ?? []) as Row[]).slice(0, 40);

  return (
    <PageContainer>
      <PageHeader
        title="Tasks" description="Plan, track and deliver work across projects."
        breadcrumbs={[{ label: "Projects" }, { label: "Tasks" }]}
        actions={
          <>
            <Segmented value={view} onChange={(v) => setView(v)} options={[
              { value: "kanban", label: <span className="flex items-center gap-1.5"><KanbanSquare className="h-4 w-4" /> Kanban</span> },
              { value: "list", label: <span className="flex items-center gap-1.5"><ListIcon className="h-4 w-4" /> List</span> },
              { value: "calendar", label: <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Calendar</span> },
            ]} />
            <Button size="sm" onClick={() => toast("Task created")}><Plus className="h-4 w-4" /> New task</Button>
          </>
        }
      />
      {view === "kanban" && (
        <div className="grid auto-cols-[260px] grid-flow-col gap-4 overflow-x-auto pb-2 lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-5">
          {KANBAN_COLS.map((col) => {
            const cards = rows.filter((t) => String(t.status) === col.id);
            return (
              <div key={col.id} className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between px-1.5 py-1.5">
                  <p className="text-[13px] font-bold">{col.label}</p>
                  <Badge variant="secondary">{cards.length}</Badge>
                </div>
                <div className="space-y-2">
                  {cards.slice(0, 6).map((t) => (
                    <div key={String(t.id)} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                      <p className="text-[13px] font-medium leading-snug">{String(t.title)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{String(t.project)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Avatar name={String(t.assignee)} size="xs" /><span className="text-[11px] text-muted-foreground">{String(t.assignee).split(" ")[0]}</span></span>
                        <PriorityBadge priority={String(t.priority)} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Due {formatDate(String(t.dueDate))}</span>
                        <span>💬 {String(t.comments)}</span>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {view === "list" && (
        <ResourcePage<Row>
          title="Tasks" description="All tasks in list view."
          listHook={(p: ListParams) => useTasks(p) as never}
          columns={() => [
            { key: "title", header: "Task", accessor: (r) => <EntityCell name={String(r.title)} sub={String(r.project)} /> },
            { key: "assignee", header: "Assignee" },
            { key: "dueDate", header: "Due", accessor: (r) => formatDate(String(r.dueDate)) },
            { key: "priority", header: "Priority", accessor: (r) => <PriorityBadge priority={String(r.priority)} /> },
            { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
          ]}
          exportFilename="tasks"
          createFields={[
            { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
            { name: "project", label: "Project", type: "text", required: true },
            { name: "assignee", label: "Assignee", type: "text" },
            { name: "dueDate", label: "Due date", type: "date" },
            { name: "priority", label: "Priority", type: "select", options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" }] },
          ]}
          createPermission={P.TASKS_CREATE}
          invalidateKeys={[QUERY_KEYS.tasks]}
        />
      )}
      {view === "calendar" && (
        <Card>
          <CardHeader><CardTitle>September 2026</CardTitle><span className="text-xs text-muted-foreground">Deadlines this month</span></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <p key={d} className="py-1 font-bold text-muted-foreground">{d}</p>)}
              {Array.from({ length: 30 }).map((_, i) => {
                const dayTasks = rows.filter((_, j) => (j + i) % 11 === 0).slice(0, 2);
                return (
                  <div key={i} className={`min-h-[64px] rounded-lg border p-1 text-left ${i === 5 ? "border-primary bg-primary/5" : "border-border"}`}>
                    <p className={`text-[11px] font-bold ${i === 5 ? "text-primary" : ""}`}>{i + 1}</p>
                    {dayTasks.map((t) => (
                      <p key={String(t.id)} className="mt-0.5 truncate rounded bg-muted px-1 py-0.5 text-[10px]">{String(t.title)}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export function MilestonesPage() {
  useDocumentTitle("Milestones");
  const q = useMilestones({ page: 1, pageSize: 50 });
  return (
    <PageContainer>
      <PageHeader title="Milestones" description="Key delivery checkpoints across projects." breadcrumbs={[{ label: "Projects" }, { label: "Milestones" }]} actions={<Button size="sm" onClick={() => toast("Milestone created")}>New milestone</Button>} />
      <DataTable<Row>
        columns={[
          { key: "title", header: "Milestone", accessor: (r) => <EntityCell name={String(r.title)} sub={String(r.project)} /> },
          { key: "owner", header: "Owner" },
          { key: "dueDate", header: "Due date", accessor: (r) => formatDate(String(r.dueDate)) },
          { key: "progress", header: "Progress", accessor: (r) => <span className="flex items-center gap-2"><Progress value={Number(r.progress)} className="w-28" />{Number(r.progress)}%</span> },
          { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status) === "completed" ? "completed" : String(r.status)} /> },
        ]}
        query={{ data: q.data as never, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch() }}
        exportFilename="milestones"
      />
    </PageContainer>
  );
}

export function TimeTrackingPage() {
  useDocumentTitle("Time Tracking");
  const entries = [
    { user: "Liam Carter", project: "Atlas Rollout", task: "API integration #12", date: "Sep 5, 2026", hours: 7.5, billable: true },
    { user: "Maya Chen", project: "Orion Portal", task: "UI polish #31", date: "Sep 5, 2026", hours: 6.0, billable: true },
    { user: "Noah Benali", project: "Atlas Rollout", task: "QA testing #22", date: "Sep 4, 2026", hours: 8.0, billable: true },
    { user: "Sofia Rossi", project: "Cobalt Cloud", task: "Deployment #8", date: "Sep 4, 2026", hours: 5.5, billable: false },
    { user: "Ethan Wright", project: "Summit ERP", task: "Requirement analysis #3", date: "Sep 3, 2026", hours: 7.0, billable: true },
  ];
  const [tracking, setTracking] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!tracking) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [tracking]);
  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <PageContainer>
      <PageHeader title="Time Tracking" description="Log hours against projects and tasks." breadcrumbs={[{ label: "Projects" }, { label: "Time Tracking" }]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Logged this week" value="34.5h" tone="info" />
        <StatCard label="Billable" value="29h (84%)" tone="success" />
        <StatCard label="Team capacity" value="78%" tone="warning" />
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-3 pt-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-3 text-primary"><Clock className="h-6 w-6" /></span>
            <div><p className="text-2xl font-bold tabular-nums">{fmt(seconds)}</p><p className="text-xs text-muted-foreground">{tracking ? "Tracking — Atlas Rollout / API integration" : "Timer stopped"}</p></div>
          </div>
          <div className="flex gap-2">
            {!tracking ? (
              <Button onClick={() => setTracking(true)}>Start timer</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setTracking(false); }}>Pause</Button>
                <Button onClick={() => { setTracking(false); setSeconds(0); toast("Time logged", { message: "Entry saved to Atlas Rollout." }); }}>Stop & log</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent entries</CardTitle><Link to={ROUTES.REPORTS} className="text-xs font-medium text-primary hover:underline">Timesheet report</Link></CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {entries.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar name={e.user} size="sm" />
                  <div><p className="text-[13px] font-semibold">{e.task}</p><p className="text-xs text-muted-foreground">{e.user} · {e.project} · {e.date}</p></div>
                </div>
                <span className="flex items-center gap-2"><Badge variant={e.billable ? "success" : "secondary"}>{e.billable ? "Billable" : "Non-billable"}</Badge><span className="text-sm font-bold">{e.hours}h</span></span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <p className="hidden">{humanize("active")} {projectFields.length}</p>
    </PageContainer>
  );
}
