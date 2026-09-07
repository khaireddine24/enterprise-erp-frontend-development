import * as React from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { PERMISSIONS, ROUTES } from "@/constants/app";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { RedirectIfAuthenticated, RequireAuth, RequirePermission } from "@/app/guards";
import { Card, CardContent, Skeleton } from "@/components/ui/primitives";

function SuspenseFallback() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 px-4 py-5 sm:px-6 lg:px-8" aria-label="Loading page">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}><CardContent className="space-y-2 pt-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-32" /></CardContent></Card>
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function lazy<T extends object>(mod: Promise<T>, pick: (m: T) => React.ComponentType) {
  const C = React.lazy(() => mod.then((m) => ({ default: pick(m) })));
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <C />
    </React.Suspense>
  );
}

function perm(permission: string | string[], module: string, element: React.ReactNode) {
  return <RequirePermission permission={permission} module={module}>{element}</RequirePermission>;
}

const P = PERMISSIONS;

export const router = createHashRouter([
  { path: ROUTES.ROOT, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  {
    element: <RedirectIfAuthenticated><AuthLayout /></RedirectIfAuthenticated>,
    children: [
      { path: ROUTES.LOGIN, element: lazy(import("@/features/auth/pages"), (m) => m.LoginPage) },
      { path: ROUTES.FORGOT_PASSWORD, element: lazy(import("@/features/auth/pages"), (m) => m.ForgotPasswordPage) },
      { path: ROUTES.RESET_PASSWORD, element: lazy(import("@/features/auth/pages"), (m) => m.ResetPasswordPage) },
      { path: ROUTES.VERIFY_2FA, element: lazy(import("@/features/auth/pages"), (m) => m.Verify2FAPage) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: perm(P.DASHBOARD_READ, "dashboard", lazy(import("@/features/dashboard/DashboardPage"), (m) => m.default)) },
          /* CRM */
          { path: ROUTES.CRM.CUSTOMERS, element: perm(P.CUSTOMERS_READ, "customers", lazy(import("@/features/crm/CrmPages"), (m) => m.CustomersPage)) },
          { path: ROUTES.CRM.CUSTOMER_DETAILS, element: perm(P.CUSTOMERS_READ, "customers", lazy(import("@/features/crm/CrmPages"), (m) => m.CustomerDetailsPage)) },
          { path: ROUTES.CRM.CONTACTS, element: perm(P.CUSTOMERS_READ, "contacts", lazy(import("@/features/crm/CrmPages"), (m) => m.ContactsPage)) },
          { path: ROUTES.CRM.LEADS, element: perm(P.LEADS_READ, "leads", lazy(import("@/features/crm/CrmPages"), (m) => m.LeadsPage)) },
          { path: ROUTES.CRM.OPPORTUNITIES, element: perm(P.OPPORTUNITIES_READ, "opportunities", lazy(import("@/features/crm/CrmPages"), (m) => m.OpportunitiesPage)) },
          /* Sales */
          { path: ROUTES.SALES.QUOTATIONS, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.QuotationsPage)) },
          { path: ROUTES.SALES.ORDERS, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.SalesOrdersPage)) },
          { path: ROUTES.SALES.DELIVERIES, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.DeliveriesPage)) },
          { path: ROUTES.SALES.INVOICES, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.InvoicesPage)) },
          { path: ROUTES.SALES.INVOICE_DETAILS, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.InvoiceDetailsPage)) },
          { path: ROUTES.SALES.CREDIT_NOTES, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.CreditNotesPage)) },
          { path: ROUTES.SALES.PAYMENTS, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.PaymentsPage)) },
          { path: ROUTES.SALES.RETURNS, element: perm(P.SALES_READ, "sales", lazy(import("@/features/sales/SalesPages"), (m) => m.SalesReturnsPage)) },
          /* Purchases */
          { path: ROUTES.PURCHASES.SUPPLIERS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.SuppliersPage)) },
          { path: ROUTES.PURCHASES.SUPPLIER_DETAILS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.SupplierDetailsPage)) },
          { path: ROUTES.PURCHASES.REQUESTS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.PurchaseRequestsPage)) },
          { path: ROUTES.PURCHASES.QUOTATIONS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.PurchaseQuotationsPage)) },
          { path: ROUTES.PURCHASES.ORDERS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.PurchaseOrdersPage)) },
          { path: "/purchases/orders/:id", element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.PurchaseOrderDetailsPage)) },
          { path: ROUTES.PURCHASES.RECEIPTS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.GoodsReceiptsPage)) },
          { path: ROUTES.PURCHASES.INVOICES, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.SupplierInvoicesPage)) },
          { path: ROUTES.PURCHASES.PAYMENTS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.SupplierPaymentsPage)) },
          { path: ROUTES.PURCHASES.RETURNS, element: perm(P.PURCHASES_READ, "purchases", lazy(import("@/features/purchases/PurchasePages"), (m) => m.PurchaseReturnsPage)) },
          /* Inventory */
          { path: ROUTES.INVENTORY.PRODUCTS, element: perm(P.PRODUCTS_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.ProductsPage)) },
          { path: ROUTES.INVENTORY.PRODUCT_DETAILS, element: perm(P.PRODUCTS_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.ProductDetailsPage)) },
          { path: ROUTES.INVENTORY.CATEGORIES, element: perm(P.PRODUCTS_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.CategoriesPage)) },
          { path: ROUTES.INVENTORY.WAREHOUSES, element: perm(P.INVENTORY_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.WarehousesPage)) },
          { path: ROUTES.INVENTORY.MOVEMENTS, element: perm(P.INVENTORY_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.MovementsPage)) },
          { path: ROUTES.INVENTORY.TRANSFERS, element: perm(P.INVENTORY_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.TransfersPage)) },
          { path: ROUTES.INVENTORY.ADJUSTMENTS, element: perm(P.INVENTORY_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.AdjustmentsPage)) },
          { path: ROUTES.INVENTORY.VALUATION, element: perm(P.INVENTORY_READ, "inventory", lazy(import("@/features/inventory/InventoryPages"), (m) => m.ValuationPage)) },
          /* Accounting */
          { path: ROUTES.ACCOUNTING.OVERVIEW, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.AccountingOverviewPage)) },
          { path: ROUTES.ACCOUNTING.CHART_OF_ACCOUNTS, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.ChartOfAccountsPage)) },
          { path: ROUTES.ACCOUNTING.JOURNAL, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.JournalPage)) },
          { path: ROUTES.ACCOUNTING.RECEIVABLES, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.ReceivablesPage)) },
          { path: ROUTES.ACCOUNTING.PAYABLES, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.PayablesPage)) },
          { path: ROUTES.ACCOUNTING.EXPENSES, element: perm(P.EXPENSES_READ, "expenses", lazy(import("@/features/accounting/AccountingPages"), (m) => m.ExpensesPage)) },
          { path: ROUTES.ACCOUNTING.TAXES, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.TaxesPage)) },
          { path: ROUTES.ACCOUNTING.PROFIT_LOSS, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.ProfitLossPage)) },
          { path: ROUTES.ACCOUNTING.BALANCE_SHEET, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.BalanceSheetPage)) },
          { path: ROUTES.ACCOUNTING.CASH_FLOW, element: perm(P.ACCOUNTING_READ, "accounting", lazy(import("@/features/accounting/AccountingPages"), (m) => m.CashFlowStatementPage)) },
          /* HR */
          { path: ROUTES.HR.EMPLOYEES, element: perm(P.EMPLOYEES_READ, "HR", lazy(import("@/features/hr/HrPages"), (m) => m.EmployeesPage)) },
          { path: ROUTES.HR.EMPLOYEE_DETAILS, element: perm(P.EMPLOYEES_READ, "HR", lazy(import("@/features/hr/HrPages"), (m) => m.EmployeeDetailsPage)) },
          { path: ROUTES.HR.DEPARTMENTS, element: perm(P.EMPLOYEES_READ, "HR", lazy(import("@/features/hr/HrPages"), (m) => m.DepartmentsPage)) },
          { path: ROUTES.HR.ATTENDANCE, element: perm(P.ATTENDANCE_READ, "attendance", lazy(import("@/features/hr/HrPages"), (m) => m.AttendancePage)) },
          { path: ROUTES.HR.LEAVES, element: perm(P.LEAVES_READ, "leaves", lazy(import("@/features/hr/HrPages"), (m) => m.LeavesPage)) },
          { path: ROUTES.HR.PAYROLL, element: perm(P.PAYROLL_READ, "payroll", lazy(import("@/features/hr/HrPages"), (m) => m.PayrollPage)) },
          { path: ROUTES.HR.EVALUATIONS, element: perm(P.EMPLOYEES_READ, "HR", lazy(import("@/features/hr/HrPages"), (m) => m.EvaluationsPage)) },
          /* Projects */
          { path: ROUTES.PROJECTS.LIST, element: perm(P.PROJECTS_READ, "projects", lazy(import("@/features/projects/ProjectPages"), (m) => m.ProjectsPage)) },
          { path: ROUTES.PROJECTS.DETAILS, element: perm(P.PROJECTS_READ, "projects", lazy(import("@/features/projects/ProjectPages"), (m) => m.ProjectDetailsPage)) },
          { path: ROUTES.PROJECTS.TASKS, element: perm(P.TASKS_READ, "tasks", lazy(import("@/features/projects/ProjectPages"), (m) => m.TasksPage)) },
          { path: ROUTES.PROJECTS.MILESTONES, element: perm(P.PROJECTS_READ, "projects", lazy(import("@/features/projects/ProjectPages"), (m) => m.MilestonesPage)) },
          { path: ROUTES.PROJECTS.TIME_TRACKING, element: perm(P.PROJECTS_READ, "projects", lazy(import("@/features/projects/ProjectPages"), (m) => m.TimeTrackingPage)) },
          /* Assets */
          { path: ROUTES.ASSETS.LIST, element: perm(P.ASSETS_READ, "assets", lazy(import("@/features/assets/AssetPages"), (m) => m.AssetsPage)) },
          { path: ROUTES.ASSETS.DETAILS, element: perm(P.ASSETS_READ, "assets", lazy(import("@/features/assets/AssetPages"), (m) => m.AssetDetailsPage)) },
          { path: ROUTES.ASSETS.MAINTENANCE, element: perm(P.ASSETS_READ, "assets", lazy(import("@/features/assets/AssetPages"), (m) => m.MaintenancePage)) },
          /* Documents / Reports / Workflow */
          { path: ROUTES.DOCUMENTS, element: perm(P.DOCUMENTS_READ, "documents", lazy(import("@/features/documents/DocumentPages"), (m) => m.DocumentsPage)) },
          { path: ROUTES.REPORTS, element: perm(P.REPORTS_READ, "reports", lazy(import("@/features/reports/ReportPages"), (m) => m.ReportsPage)) },
          { path: ROUTES.NOTIFICATIONS, element: lazy(import("@/features/notifications/WorkflowPages"), (m) => m.NotificationsPage) },
          { path: ROUTES.APPROVALS, element: lazy(import("@/features/notifications/WorkflowPages"), (m) => m.ApprovalsPage) },
          { path: ROUTES.AUDIT_LOGS, element: perm(P.AUDIT_READ, "audit logs", lazy(import("@/features/notifications/WorkflowPages"), (m) => m.AuditLogsPage)) },
          /* Settings */
          {
            path: ROUTES.SETTINGS.ROOT,
            element: perm(P.SETTINGS_READ, "settings", lazy(import("@/features/settings/SettingsPages"), (m) => m.SettingsLayout)),
            children: [
              { index: true, element: lazy(import("@/features/settings/SettingsPages"), (m) => m.SettingsIndexRedirect) },
              { path: "company", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.CompanySettingsPage) },
              { path: "profile", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.ProfileSettingsPage) },
              { path: "users", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.UsersSettingsPage) },
              { path: "roles", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.RolesSettingsPage) },
              { path: "erp", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.ErpSettingsPage) },
              { path: "security", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.SecuritySettingsPage) },
              { path: "notifications", element: lazy(import("@/features/settings/SettingsPages"), (m) => m.NotificationPrefsPage) },
            ],
          },
        ],
      },
    ],
  },
  { path: ROUTES.FORBIDDEN, element: lazy(import("@/pages/errors"), (m) => m.ForbiddenPage) },
  { path: ROUTES.SERVER_ERROR, element: lazy(import("@/pages/errors"), (m) => m.ServerErrorPage) },
  { path: "*", element: lazy(import("@/pages/errors"), (m) => m.NotFoundPage) },
]);

/* Preload hints to keep nav snappy */
export function preloadModule(name: string) {
  const map: Record<string, () => Promise<unknown>> = {
    dashboard: () => import("@/features/dashboard/DashboardPage"),
    crm: () => import("@/features/crm/CrmPages"),
    sales: () => import("@/features/sales/SalesPages"),
    auth: () => import("@/features/auth/pages"),
    purchases: () => import("@/features/purchases/PurchasePages"),
    inventory: () => import("@/features/inventory/InventoryPages"),
    accounting: () => import("@/features/accounting/AccountingPages"),
    hr: () => import("@/features/hr/HrPages"),
    projects: () => import("@/features/projects/ProjectPages"),
    assets: () => import("@/features/assets/AssetPages"),
    documents: () => import("@/features/documents/DocumentPages"),
    reports: () => import("@/features/reports/ReportPages"),
    workflow: () => import("@/features/notifications/WorkflowPages"),
    settings: () => import("@/features/settings/SettingsPages"),
    errors: () => import("@/pages/errors"),
  };
  void map[name]?.();
}

void preloadModule;
