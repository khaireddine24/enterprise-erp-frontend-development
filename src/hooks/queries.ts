/* TanStack Query hooks — one hook per list/detail resource. Pages never fetch directly. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListParams } from "@/types";
import { QUERY_KEYS } from "@/constants/app";
import * as S from "@/services/erp.service";

function listKey(key: string, params: ListParams) {
  return [key, params.page, params.pageSize, params.search ?? "", params.sortBy ?? "", params.sortDir ?? "", JSON.stringify(params.filters ?? {})] as const;
}

function makeListHook<T>(key: string, service: { list: (p: ListParams) => Promise<import("@/types").PaginatedResponse<T>> }) {
  return (params: ListParams) =>
    useQuery({
      queryKey: listKey(key, params),
      queryFn: () => service.list(params),
      placeholderData: (prev) => prev,
    });
}

function makeDetailHook<T>(key: string, service: { get: (id: string) => Promise<T | undefined> }) {
  return (id: string | undefined) =>
    useQuery({
      queryKey: [key, id],
      queryFn: () => service.get(id as string),
      enabled: !!id,
    });
}

export const useCustomers = makeListHook(QUERY_KEYS.customers, S.CustomerService);
export const useCustomer = makeDetailHook(QUERY_KEYS.customer, S.CustomerService);
export const useContacts = makeListHook(QUERY_KEYS.contacts, S.ContactService);
export const useLeads = makeListHook(QUERY_KEYS.leads, S.LeadService);
export const useOpportunities = makeListHook(QUERY_KEYS.opportunities, S.OpportunityService);

export const useQuotations = makeListHook(QUERY_KEYS.quotations, S.QuotationService);
export const useSalesOrders = makeListHook(QUERY_KEYS.salesOrders, S.SalesOrderService);
export const useDeliveries = makeListHook(QUERY_KEYS.deliveries, S.DeliveryService);
export const useInvoices = makeListHook(QUERY_KEYS.invoices, S.InvoiceService);
export const useInvoice = makeDetailHook(QUERY_KEYS.invoice, S.InvoiceService);
export const useCreditNotes = makeListHook(QUERY_KEYS.creditNotes, S.CreditNoteService);
export const usePayments = makeListHook(QUERY_KEYS.payments, S.PaymentService);
export const useSalesReturns = makeListHook(QUERY_KEYS.salesReturns, S.SalesReturnService);

export const useSuppliers = makeListHook(QUERY_KEYS.suppliers, S.SupplierService);
export const useSupplier = makeDetailHook(QUERY_KEYS.supplier, S.SupplierService);
export const usePurchaseRequests = makeListHook(QUERY_KEYS.purchaseRequests, S.PurchaseRequestService);
export const usePurchaseQuotations = makeListHook(QUERY_KEYS.purchaseQuotations, S.PurchaseQuotationService);
export const usePurchaseOrders = makeListHook(QUERY_KEYS.purchaseOrders, S.PurchaseOrderService);
export const useGoodsReceipts = makeListHook(QUERY_KEYS.goodsReceipts, S.GoodsReceiptService);
export const useSupplierInvoices = makeListHook(QUERY_KEYS.supplierInvoices, S.SupplierInvoiceService);
export const useSupplierPayments = makeListHook(QUERY_KEYS.supplierPayments, S.SupplierPaymentService);
export const usePurchaseReturns = makeListHook(QUERY_KEYS.purchaseReturns, S.PurchaseReturnService);

export const useProducts = makeListHook(QUERY_KEYS.products, S.ProductService);
export const useProduct = makeDetailHook(QUERY_KEYS.product, S.ProductService);
export const useCategories = makeListHook(QUERY_KEYS.categories, S.CategoryService);
export const useWarehouses = makeListHook(QUERY_KEYS.warehouses, S.WarehouseService);
export const useMovements = makeListHook(QUERY_KEYS.movements, S.MovementService);
export const useTransfers = makeListHook(QUERY_KEYS.transfers, S.TransferService);

export const useAccounts = makeListHook(QUERY_KEYS.accounts, S.AccountService);
export const useJournal = makeListHook(QUERY_KEYS.journal, S.JournalService);
export const useExpenses = makeListHook(QUERY_KEYS.expenses, S.ExpenseService);

export const useEmployees = makeListHook(QUERY_KEYS.employees, S.EmployeeService);
export const useEmployee = makeDetailHook(QUERY_KEYS.employee, S.EmployeeService);
export const useDepartments = makeListHook(QUERY_KEYS.departments, S.DepartmentService);
export const useLeaves = makeListHook(QUERY_KEYS.leaves, S.LeaveService);
export const usePayroll = makeListHook(QUERY_KEYS.payroll, S.PayrollService);
export const useAttendance = makeListHook(QUERY_KEYS.attendance, S.AttendanceService);

export const useProjects = makeListHook(QUERY_KEYS.projects, S.ProjectService);
export const useProject = makeDetailHook(QUERY_KEYS.project, S.ProjectService);
export const useTasks = makeListHook(QUERY_KEYS.tasks, S.TaskService);
export const useMilestones = makeListHook(QUERY_KEYS.milestones, S.MilestoneService);

export const useAssets = makeListHook(QUERY_KEYS.assets, S.AssetService);
export const useAsset = makeDetailHook(QUERY_KEYS.asset, S.AssetService);
export const useDocuments = makeListHook(QUERY_KEYS.documents, S.DocumentService);
export const useApprovals = makeListHook(QUERY_KEYS.approvals, S.ApprovalService);
export const useAuditLogs = makeListHook(QUERY_KEYS.auditLogs, S.AuditService);

export const useAdjustmentsFallback = (params: ListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.adjustments, params.page, params.pageSize, params.search ?? ""],
    queryFn: () => S.MovementService.list({ ...params, filters: { ...params.filters, type: "adjustment" } }),
    placeholderData: (prev) => prev,
  });

/* Dashboard */
export const useDashboardKpis = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "kpis"], queryFn: S.DashboardService.kpis });
export const useRevenueSeries = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "revenue"], queryFn: S.DashboardService.revenue });
export const useSalesPurchaseSeries = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "sales-purchases"], queryFn: S.DashboardService.salesPurchases });
export const useCashFlowSeriesHook = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "cashflow"], queryFn: S.DashboardService.cashFlow });
export const useInventoryByCategory = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "inventory-cat"], queryFn: S.DashboardService.inventoryByCategory });
export const useDepartmentPerformance = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "dept-perf"], queryFn: S.DashboardService.departmentPerformance });
export const useTopCustomers = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "top-customers"], queryFn: S.DashboardService.topCustomers });
export const useTopProducts = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "top-products"], queryFn: S.DashboardService.topProducts });
export const useRecentActivities = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "activities"], queryFn: S.DashboardService.activities });
export const useRecentInvoices = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "recent-invoices"], queryFn: S.DashboardService.recentInvoices });
export const useLowStock = () => useQuery({ queryKey: [QUERY_KEYS.dashboard, "low-stock"], queryFn: S.DashboardService.lowStock });

/* Generic mutation helpers (mock: simulate write + invalidate) */
export function useInvalidate() {
  const qc = useQueryClient();
  return (keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

export function useMockMutation(keys: string[] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { action: string; data?: unknown }) => {
      await new Promise((r) => setTimeout(r, 600));
      return payload;
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
