export type Role = 'cajero' | 'admin';

export type SystemMode = 'seed' | 'live';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface CreateUserRequest {
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  is_active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  current_stock: number;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  current_stock: number;
}

export interface UpdateProductRequest {
  price?: number;
  current_stock?: number;
}

export interface ProductFilters {
  onlyActive?: boolean;
  search?: string;
}

export interface Sale {
  id: string;
  product_id: string;
  sold_by: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  sold_at: string;
}

export interface SaleWithProduct extends Sale {
  product_name: string;
  seller_name: string | null;
}

export interface RegisterSaleRequest {
  productId: string;
  quantity: number;
}

export interface SaleFilters {
  from?: string;
  to?: string;
  productId?: string;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalIncome: number;
  topProduct: { name: string; quantity: number } | null;
}

export interface DashboardData {
  mode: SystemMode;
  summary: DailySummary;
  lowStock: { id: string; name: string; current_stock: number }[];
  lastSale: { product_name: string; quantity: number; total: number; sold_at: string } | null;
}

export type AuditAction =
  | 'login' | 'logout'
  | 'create_product' | 'update_price' | 'update_stock' | 'deactivate_product'
  | 'register_sale'
  | 'create_user' | 'toggle_user' | 'change_password'
  | 'bootstrap';

export type AuditEntity = 'product' | 'sale' | 'user' | 'system';

export interface AuditEntry {
  user_id?: string | null;
  user_email?: string | null;
  user_role?: Role | null;
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}

export class AppError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'No encontrado', details?: unknown) { super(404, message, details); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflicto', details?: unknown) { super(409, message, details); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') { super(401, message); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos') { super(403, message); }
}
export class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida', details?: unknown) { super(400, message, details); }
}
