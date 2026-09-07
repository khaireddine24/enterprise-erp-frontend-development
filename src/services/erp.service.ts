/* Service layer: Component → Hook → Service → API Client → Backend.
   Mock-backed today; swap `paginate`/`mockDelay` for `apiGet` when the backend is ready. */
import type { ListParams, PaginatedResponse } from "@/types";
import { mockDelay, paginate } from "@/lib/api-client";
import * as M from "@/mocks/data";

function makeService<T extends Record<string, unknown>>(dataset: T[], latency = 300) {
  return {
    list: (params: ListParams): Promise<PaginatedResponse<T>> =>
      mockDelay(paginate(dataset, params), latency),
    get: (id: string): Promise<T | undefined> =>
      mockDelay(dataset.find((r) => r.id === id), latency),
    all: (): Promise<T[]> => mockDelay([...dataset], latency),
  };
}

export const CustomerService = makeService<CustomerRow>(M.customers as unknown as CustomerRow[]);
export const ContactService = makeService<Record<string, unknown>>(M.contacts as unknown as Record<string, unknown>[]);
export const LeadService = makeService<Record<string, unknown>>(M.leads as unknown as Record<string, unknown>[]);
export const OpportunityService = makeService<Record<string, unknown>>(M.opportunities as unknown as Record<string, unknown>[]);

export const QuotationService = makeService<Record<string, unknown>>(M.quotations as unknown as Record<string, unknown>[]);
export const SalesOrderService = makeService<Record<string, unknown>>(M.salesOrders as unknown as Record<string, unknown>[]);
export const DeliveryService = makeService<Record<string, unknown>>(M.deliveries as unknown as Record<string, unknown>[]);
export const InvoiceService = makeService<Record<string, unknown>>(M.invoices as unknown as Record<string, unknown>[]);
export const CreditNoteService = makeService<Record<string, unknown>>(M.creditNotes as unknown as Record<string, unknown>[]);
export const PaymentService = makeService<Record<string, unknown>>(M.payments as unknown as Record<string, unknown>[]);
export const SalesReturnService = makeService<Record<string, unknown>>(M.salesReturns as unknown as Record<string, unknown>[]);

export const SupplierService = makeService<Record<string, unknown>>(M.suppliers as unknown as Record<string, unknown>[]);
export const PurchaseRequestService = makeService<Record<string, unknown>>(M.purchaseRequests as unknown as Record<string, unknown>[]);
export const PurchaseQuotationService = makeService<Record<string, unknown>>(M.purchaseQuotations as unknown as Record<string, unknown>[]);
export const PurchaseOrderService = makeService<Record<string, unknown>>(M.purchaseOrders as unknown as Record<string, unknown>[]);
export const GoodsReceiptService = makeService<Record<string, unknown>>(M.goodsReceipts as unknown as Record<string, unknown>[]);
export const SupplierInvoiceService = makeService<Record<string, unknown>>(M.supplierInvoices as unknown as Record<string, unknown>[]);
export const SupplierPaymentService = makeService<Record<string, unknown>>(M.supplierPayments as unknown as Record<string, unknown>[]);
export const PurchaseReturnService = makeService<Record<string, unknown>>(M.purchaseReturns as unknown as Record<string, unknown>[]);

export const ProductService = makeService<Record<string, unknown>>(M.products as unknown as Record<string, unknown>[]);
export const CategoryService = makeService<Record<string, unknown>>(M.categories as unknown as Record<string, unknown>[]);
export const WarehouseService = makeService<Record<string, unknown>>(M.warehouses as unknown as Record<string, unknown>[]);
export const MovementService = makeService<Record<string, unknown>>(M.movements as unknown as Record<string, unknown>[]);
export const TransferService = makeService<Record<string, unknown>>(M.transfers as unknown as Record<string, unknown>[]);

export const AccountService = makeService<Record<string, unknown>>(M.accounts as unknown as Record<string, unknown>[]);
export const JournalService = makeService<Record<string, unknown>>(M.journalEntries as unknown as Record<string, unknown>[]);
export const ExpenseService = makeService<Record<string, unknown>>(M.expenses as unknown as Record<string, unknown>[]);

export const EmployeeService = makeService<Record<string, unknown>>(M.employees as unknown as Record<string, unknown>[]);
export const DepartmentService = makeService<Record<string, unknown>>(M.departments as unknown as Record<string, unknown>[]);
export const LeaveService = makeService<Record<string, unknown>>(M.leaveRequests as unknown as Record<string, unknown>[]);
export const PayrollService = makeService<Record<string, unknown>>(M.payrollRuns as unknown as Record<string, unknown>[]);
export const AttendanceService = makeService<Record<string, unknown>>(M.attendance as unknown as Record<string, unknown>[]);

export const ProjectService = makeService<Record<string, unknown>>(M.projects as unknown as Record<string, unknown>[]);
export const TaskService = makeService<Record<string, unknown>>(M.tasks as unknown as Record<string, unknown>[]);
export const MilestoneService = makeService<Record<string, unknown>>(M.milestones as unknown as Record<string, unknown>[]);

export const AssetService = makeService<Record<string, unknown>>(M.assets as unknown as Record<string, unknown>[]);
export const DocumentService = makeService<Record<string, unknown>>(M.documents as unknown as Record<string, unknown>[]);
export const ApprovalService = makeService<Record<string, unknown>>(M.approvals as unknown as Record<string, unknown>[]);
export const AuditService = makeService<Record<string, unknown>>(M.auditLogs as unknown as Record<string, unknown>[]);

type CustomerRow = Record<string, unknown>;

export const DashboardService = {
  kpis: () => mockDelay(M.dashboardKpis, 250),
  revenue: () => mockDelay(M.revenueSeries, 250),
  salesPurchases: () => mockDelay(M.salesPurchaseSeries, 250),
  cashFlow: () => mockDelay(M.cashFlowSeries, 250),
  inventoryByCategory: () => mockDelay(M.inventoryByCategory, 250),
  departmentPerformance: () => mockDelay(M.departmentPerformance, 250),
  topCustomers: () => mockDelay(M.topCustomers, 250),
  topProducts: () => mockDelay(M.topProducts, 250),
  activities: () => mockDelay(M.recentActivities, 250),
  recentInvoices: () => mockDelay(M.invoices.slice(0, 6), 250),
  lowStock: () => mockDelay(M.products.filter((p) => p.status === "low_stock" || p.status === "out_of_stock").slice(0, 6), 250),
};
