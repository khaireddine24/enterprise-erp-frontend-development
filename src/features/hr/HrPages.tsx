import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarCheck, Check, Clock, X } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS, ROUTES } from "@/constants/app";
import {
  useAttendance, useDepartments, useEmployee, useEmployees, useLeaves, usePayroll,
} from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Avatar, Button, Card, CardContent, CardHeader, CardTitle, Progress, Tabs } from "@/components/ui/primitives";
import { DataTable } from "@/components/common/DataTable";
import { DetailGrid, EntityCell, PageContainer, PageHeader, StatCard, StatusBadge } from "@/components/common/feedback";
import { FieldConfig, ResourcePage } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatCurrency, formatDate } from "@/utils/format";
import { humanize } from "@/utils/helpers";

type Row = Record<string, unknown>;
const P = PERMISSIONS;

const employeeFields: FieldConfig[] = [
  { name: "firstName", label: "First name", type: "text", required: true },
  { name: "lastName", label: "Last name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "department", label: "Department", type: "select", required: true, options: ["Executive", "Finance", "Sales", "Human Resources", "Operations", "Engineering", "Marketing", "Support"].map((d) => ({ label: d, value: d })) },
  { name: "position", label: "Position", type: "text", required: true },
  { name: "hireDate", label: "Hire date", type: "date" },
  { name: "salary", label: "Monthly salary", type: "currency", min: 0 },
  { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Probation", value: "probation" }, { label: "On leave", value: "on_leave" }] },
];

export function EmployeesPage() {
  useDocumentTitle("Employees");
  const navigate = useNavigate();
  return (
    <ResourcePage<Row>
      title="Employees" description="Workforce directory with employment records."
      breadcrumbs={[{ label: "HR" }, { label: "Employees" }]}
      listHook={(p: ListParams) => useEmployees(p) as never}
      columns={() => [
        { key: "firstName", header: "Employee", sortable: true, accessor: (r) => <EntityCell name={`${r.firstName} ${r.lastName}`} sub={`${r.code} · ${r.position}`} /> },
        { key: "department", header: "Department", sortable: true },
        { key: "email", header: "Email", accessor: (r) => <span className="text-muted-foreground">{String(r.email)}</span> },
        { key: "hireDate", header: "Hired", accessor: (r) => formatDate(String(r.hireDate)) },
        { key: "salary", header: "Salary", align: "right", accessor: (r) => <span className="font-semibold">{formatCurrency(Number(r.salary))}</span> },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      filterDefs={[
        { key: "department", label: "Department", options: ["Executive", "Finance", "Sales", "Human Resources", "Operations", "Engineering", "Marketing", "Support"].map((d) => ({ label: d, value: d })) },
        { key: "status", label: "Status", options: ["active", "on_leave", "probation"].map((s) => ({ label: humanize(s), value: s })) },
      ]}
      exportFilename="employees"
      createFields={employeeFields}
      createPermission={P.EMPLOYEES_CREATE} updatePermission={P.EMPLOYEES_UPDATE} deletePermission={P.EMPLOYEES_DELETE}
      onRowClick={(r) => navigate(`/hr/employees/${r.id}`)}
      invalidateKeys={[QUERY_KEYS.employees]}
    />
  );
}

export function EmployeeDetailsPage() {
  const { id } = useParams();
  const { data } = useEmployee(id);
  const [tab, setTab] = React.useState("personal");
  useDocumentTitle(data ? `${data.firstName} ${data.lastName}` : "Employee");
  const e = data as Row | undefined;

  if (!e) {
    return <PageContainer><div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <Avatar name={`${e.firstName} ${e.lastName}`} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">{String(e.firstName)} {String(e.lastName)}</h1>
          <p className="text-[13px] text-muted-foreground">{String(e.position)} · {String(e.department)} · {String(e.code)}</p>
        </div>
        <StatusBadge status={String(e.status)} />
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        { value: "personal", label: "Personal" },
        { value: "employment", label: "Employment" },
        { value: "attendance", label: "Attendance" },
        { value: "leave", label: "Leave" },
        { value: "payroll", label: "Payroll" },
        { value: "documents", label: "Documents" },
        { value: "performance", label: "Performance" },
        { value: "timeline", label: "Timeline" },
      ]} />

      {tab === "personal" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "Email", value: String(e.email) },
          { label: "Phone", value: String(e.phone) },
          { label: "Location", value: String(e.location) },
          { label: "Date of birth", value: "Mar 14, 1991" },
          { label: "Nationality", value: "United States" },
          { label: "Emergency contact", value: "+1 (555) 214-8890" },
        ]} /></CardContent></Card>
      )}
      {tab === "employment" && (
        <Card><CardContent className="pt-5"><DetailGrid items={[
          { label: "Employee code", value: String(e.code) },
          { label: "Department", value: String(e.department) },
          { label: "Position", value: String(e.position) },
          { label: "Manager", value: String(e.manager) },
          { label: "Hire date", value: formatDate(String(e.hireDate)) },
          { label: "Contract", value: "Full-time · Permanent" },
        ]} /></CardContent></Card>
      )}
      {tab === "attendance" && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Present (Aug)" value="21 days" tone="success" />
          <StatCard label="Late arrivals" value="2" tone="warning" />
          <StatCard label="Absences" value="1" tone="danger" />
          <StatCard label="Avg. hours/day" value="8.4h" tone="info" />
        </div>
      )}
      {tab === "leave" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Annual balance", "14 / 22 days", 64], ["Sick balance", "8 / 10 days", 80], ["Pending requests", "1 request", 20]].map(([k, v, pct]) => (
            <Card key={k}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg font-bold">{v as string}</p><Progress value={Number(pct)} className="mt-2" /></CardContent></Card>
          ))}
        </div>
      )}
      {tab === "payroll" && (
        <Card>
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-4">Period</th><th className="py-2 pr-4 text-right">Gross</th><th className="py-2 pr-4 text-right">Deductions</th><th className="py-2 text-right">Net</th></tr></thead>
                <tbody>
                  {["August 2026", "July 2026", "June 2026"].map((m) => {
                    const gross = Number(e.salary);
                    return (
                      <tr key={m} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{m}</td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(gross)}</td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(gross * 0.24)}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-600">{formatCurrency(gross * 0.76)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {tab === "documents" && (
        <Card><CardContent className="pt-5">
          <ul className="divide-y divide-border">
            {["Employment Contract.pdf", "ID Copy.pdf", "Tax Declaration.pdf", "NDA Agreement.pdf"].map((d) => (
              <li key={d} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium">{d}</span>
                <Button variant="ghost" size="xs" onClick={() => toast("Download started", { message: d })}>Download</Button>
              </li>
            ))}
          </ul>
        </CardContent></Card>
      )}
      {tab === "performance" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[["Q2 2026 Review", "Exceeds expectations", 92, "Strong delivery on Atlas rollout; great collaboration."], ["Q1 2026 Review", "Meets expectations", 78, "Solid quarter with room to grow in documentation."]].map(([t, r, pct, c]) => (
            <Card key={t}><CardHeader><CardTitle>{t}</CardTitle><StatusBadge status="completed" /></CardHeader>
              <CardContent><p className="text-sm font-semibold">{r as string}</p><Progress value={Number(pct)} className="my-2" /><p className="text-[13px] text-muted-foreground">{c as string}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
      {tab === "timeline" && (
        <Card><CardContent className="space-y-2.5 pt-5">
          {[["Promoted to current role", "Jan 2026"], ["Completed leadership training", "Nov 2025"], ["Annual review — exceeds expectations", "Jul 2025"], ["Joined Nexora", formatDate(String(e.hireDate))]].map(([a, t]) => (
            <div key={a} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px]">
              <span className="font-medium">{a}</span><span className="text-xs text-muted-foreground">{t}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
    </PageContainer>
  );
}

export function DepartmentsPage() {
  useDocumentTitle("Departments");
  const q = useDepartments({ page: 1, pageSize: 20 });
  return (
    <PageContainer>
      <PageHeader title="Departments" description="Organization structure and budgets." breadcrumbs={[{ label: "HR" }, { label: "Departments" }]} actions={<Button size="sm" onClick={() => toast("Department created")}>New department</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {((q.data?.data ?? []) as Row[]).map((d) => (
          <Card key={String(d.id)}>
            <CardContent className="pt-5">
              <p className="text-sm font-bold">{String(d.name)}</p>
              <p className="text-xs text-muted-foreground">{String(d.code)} · Head: {String(d.head)}</p>
              <p className="mt-3 text-2xl font-bold">{String(d.employees)} <span className="text-xs font-normal text-muted-foreground">members</span></p>
              <div className="mt-2">
                <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Budget used</span><span className="font-bold">{Math.round((Number(d.spent) / Math.max(1, Number(d.budget))) * 100)}%</span></div>
                <Progress value={(Number(d.spent) / Math.max(1, Number(d.budget))) * 100} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

export function AttendancePage() {
  useDocumentTitle("Attendance");
  return (
    <ResourcePage<Row>
      title="Attendance" description="Daily check-in/out with presence analytics."
      breadcrumbs={[{ label: "HR" }, { label: "Attendance" }]}
      listHook={(p: ListParams) => useAttendance(p) as never}
      columns={() => [
        { key: "employee", header: "Employee", sortable: true, accessor: (r) => <EntityCell name={String(r.employee)} sub={String(r.department)} /> },
        { key: "date", header: "Date", sortable: true, accessor: (r) => formatDate(String(r.date)) },
        { key: "checkIn", header: "Check in", accessor: (r) => <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{String(r.checkIn)}</span> },
        { key: "checkOut", header: "Check out", accessor: (r) => String(r.checkOut) },
        { key: "hours", header: "Hours", align: "right", accessor: (r) => `${r.hours}h` },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status === "present" ? "completed" : r.status === "late" ? "pending" : r.status === "leave" ? "review" : "rejected"} /> },
      ]}
      filterDefs={[{ key: "status", label: "Status", options: [{ label: "Present", value: "present" }, { label: "Late", value: "late" }, { label: "Absent", value: "absent" }, { label: "Leave", value: "leave" }] }]}
      exportFilename="attendance"
      extraActions={<Button size="sm" onClick={() => toast("Checked in", { message: "Your check-in at 08:30 was recorded." })}><CalendarCheck className="h-4 w-4" /> Check in</Button>}
      invalidateKeys={[QUERY_KEYS.attendance]}
    />
  );
}

export function LeavesPage() {
  useDocumentTitle("Leave Requests");
  return (
    <ResourcePage<Row>
      title="Leave Requests" description="Balances, approvals and leave calendar."
      breadcrumbs={[{ label: "HR" }, { label: "Leaves" }]}
      listHook={(p: ListParams) => useLeaves(p) as never}
      columns={() => [
        { key: "employee", header: "Employee", sortable: true, accessor: (r) => <EntityCell name={String(r.employee)} sub={String(r.type)} /> },
        { key: "from", header: "From", accessor: (r) => formatDate(String(r.from)) },
        { key: "to", header: "To", accessor: (r) => formatDate(String(r.to)) },
        { key: "days", header: "Days", align: "right", accessor: (r) => String(r.days) },
        { key: "reason", header: "Reason", accessor: (r) => <span className="text-muted-foreground">{String(r.reason)}</span> },
        { key: "approver", header: "Approver" },
        { key: "status", header: "Status", accessor: (r) => <StatusBadge status={String(r.status) === "cancelled" ? "cancelled" : String(r.status)} /> },
      ]}
      filterDefs={[
        { key: "status", label: "Status", options: ["pending", "approved", "rejected", "cancelled"].map((s) => ({ label: humanize(s), value: s })) },
        { key: "type", label: "Type", options: ["Annual", "Sick", "Unpaid", "Maternity", "Emergency"].map((t) => ({ label: t, value: t })) },
      ]}
      exportFilename="leave-requests"
      createFields={[
        { name: "employee", label: "Employee", type: "text", required: true },
        { name: "type", label: "Leave type", type: "select", required: true, options: ["Annual", "Sick", "Unpaid", "Maternity", "Emergency"].map((t) => ({ label: t, value: t })) },
        { name: "from", label: "From", type: "date", required: true },
        { name: "to", label: "To", type: "date", required: true },
        { name: "reason", label: "Reason", type: "textarea", fullWidth: true, required: true },
      ]}
      createPermission={P.LEAVES_CREATE}
      extraActions={
        <>
          <Button variant="outline" size="sm" onClick={() => toast("Leave approved", { message: "Pending requests were approved." })}><Check className="h-4 w-4" /> Approve all</Button>
          <Button variant="outline" size="sm" onClick={() => toast("Leave rejected", { message: "The selected request was rejected.", variant: "info" })}><X className="h-4 w-4" /> Reject</Button>
        </>
      }
      invalidateKeys={[QUERY_KEYS.leaves]}
    />
  );
}

export function PayrollPage() {
  useDocumentTitle("Payroll");
  const q = usePayroll({ page: 1, pageSize: 20 });
  return (
    <PageContainer>
      <PageHeader title="Payroll" description="Monthly runs, gross-to-net and payslips." breadcrumbs={[{ label: "HR" }, { label: "Payroll" }]} actions={<Button size="sm" onClick={() => toast("Payroll draft created", { message: "September 2026 draft is being calculated." })}>Run payroll</Button>} />
      <DataTable<Row>
        columns={[
          { key: "number", header: "Run", sortable: true, accessor: (r) => <span className="font-semibold text-primary">{String(r.number)}</span> },
          { key: "period", header: "Period" },
          { key: "payDate", header: "Pay date", accessor: (r) => formatDate(String(r.payDate)) },
          { key: "employees", header: "Employees", align: "right" },
          { key: "gross", header: "Gross", align: "right", accessor: (r) => formatCurrency(Number(r.gross)) },
          { key: "deductions", header: "Deductions", align: "right", accessor: (r) => formatCurrency(Number(r.deductions)) },
          { key: "net", header: "Net pay", align: "right", accessor: (r) => <span className="font-bold text-emerald-600">{formatCurrency(Number(r.net))}</span> },
          { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status === "paid" ? "paid" : "draft"} /> },
        ]}
        query={{ data: q.data as never, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch() }}
        exportFilename="payroll"
      />
      <p className="text-xs text-muted-foreground">Payroll is read-only in this demo workspace. <Link to={ROUTES.HR.EMPLOYEES} className="font-medium text-primary hover:underline">Manage employees →</Link></p>
    </PageContainer>
  );
}

export function EvaluationsPage() {
  useDocumentTitle("Evaluations");
  const emps = useEmployees({ page: 1, pageSize: 8 });
  return (
    <PageContainer>
      <PageHeader title="Employee Evaluations" description="Review cycles, ratings and goals." breadcrumbs={[{ label: "HR" }, { label: "Evaluations" }]} actions={<Button size="sm" onClick={() => toast("Review cycle started", { message: "Q3 2026 reviews are now open." })}>Start review cycle</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {((emps.data?.data ?? []) as Row[]).map((e, i) => (
          <Card key={String(e.id)}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2.5">
                <Avatar name={`${e.firstName} ${e.lastName}`} />
                <div><p className="text-sm font-bold">{String(e.firstName)} {String(e.lastName)}</p><p className="text-xs text-muted-foreground">{String(e.position)}</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]"><span className="text-muted-foreground">Q2 score</span><span className="font-bold">{88 - i * 2}/100</span></div>
              <Progress value={88 - i * 2} className="mt-1.5" />
              <StatusBadge status={i % 3 === 0 ? "completed" : "review"} className="mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
