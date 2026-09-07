/* Shared domain-agnostic types + generic API contracts. */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortDir: "asc" | "desc";
}

export type FilterValue = string | number | boolean | string[] | undefined;

export interface FilterParams {
  search?: string;
  [key: string]: FilterValue;
}

export interface ListParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, FilterValue>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  department?: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  hidden?: boolean;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onSelect: (rows: T[]) => void;
}

export type ThemeMode = "light" | "dark" | "system";

export interface Money {
  amount: number;
  currency: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface DashboardDateRange {
  from: Date;
  to: Date;
  preset: "today" | "week" | "month" | "quarter" | "year" | "custom";
}
