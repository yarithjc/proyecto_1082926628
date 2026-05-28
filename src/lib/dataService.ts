import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './supabase';
import { countMigrationsApplied, runPendingMigrations } from './pgMigrate';
import { getSeedAdmin, readSeed } from './seedReader';
import { recordAudit } from './audit';
import { todayRangeUTC } from './dateUtils';
import {
  type CreateProductRequest,
  type CreateUserRequest,
  type DailySummary,
  type DashboardData,
  type Product,
  type ProductFilters,
  type RegisterSaleRequest,
  type UpdateSaleRequest,
  type Role,
  type SafeUser,
  type Sale,
  type SaleFilters,
  type SaleWithProduct,
  type SystemMode,
  type UpdateUserRequest,
  type User,
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from './types';

let _mode: SystemMode | null = null;
let _modeChecked = false;

function stripPassword(u: User): SafeUser {
  const { password_hash: _ph, ...safe } = u;
  void _ph;
  return safe;
}

export async function getSystemMode(): Promise<SystemMode> {
  if (_modeChecked && _mode) return _mode;
  try {
    const applied = await countMigrationsApplied();
    _mode = applied >= 1 ? 'live' : 'seed';
  } catch {
    _mode = 'seed';
  }
  _modeChecked = true;
  return _mode;
}

export function invalidateModeCache() {
  _mode = null;
  _modeChecked = false;
}

// ===================== AUTH / USERS =====================

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const admin = getSeedAdmin();
    if (admin.email.toLowerCase() !== normalized) return null;
    const password_hash = await bcrypt.hash(admin.password_plain, 10);
    return {
      id: 'seed-admin',
      name: admin.name,
      email: admin.email,
      password_hash,
      role: admin.role,
      is_active: true,
      must_change_password: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
  }
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from('users')
    .select('*')
    .ilike('email', normalized)
    .maybeSingle();
  if (error || !data) return null;
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  if (id === 'seed-admin') {
    const admin = getSeedAdmin();
    const password_hash = await bcrypt.hash(admin.password_plain, 10);
    return {
      id: 'seed-admin',
      name: admin.name,
      email: admin.email,
      password_hash,
      role: admin.role,
      is_active: true,
      must_change_password: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
  }
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data } = await sb.from('users').select('*').eq('id', id).maybeSingle();
  return (data as User) ?? null;
}

export async function touchLastLogin(userId: string): Promise<void> {
  if (userId === 'seed-admin') return;
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', userId);
}

export async function listUsers(): Promise<SafeUser[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data } = await sb.from('users').select('*').order('created_at', { ascending: false });
  return (data as User[] | null)?.map(stripPassword) ?? [];
}

export async function createUser(
  actor: { id: string; email: string; role: Role },
  data: CreateUserRequest
): Promise<{ user: SafeUser; tempPassword: string }> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const tempPassword = Math.random().toString(36).slice(2, 10) + 'A!';
  const hash = await bcrypt.hash(tempPassword, 10);
  const { data: row, error } = await sb
    .from('users')
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash: hash,
      role: data.role,
      is_active: true,
      must_change_password: true,
    })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') throw new ConflictError('Email ya registrado');
    throw new AppError(500, error.message);
  }
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'create_user',
    entity: 'user',
    entity_id: (row as User).id,
    summary: `Creó usuario ${data.email} (${data.role})`,
  });
  return { user: stripPassword(row as User), tempPassword };
}

export async function updateUser(
  actor: { id: string; email: string; role: Role },
  id: string,
  data: UpdateUserRequest
): Promise<SafeUser> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  if (id === actor.id && data.is_active === false) {
    throw new BadRequestError('No puedes desactivarte a ti mismo');
  }
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const { data: row, error } = await sb
    .from('users')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !row) throw new NotFoundError('Usuario no encontrado');
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'toggle_user',
    entity: 'user',
    entity_id: id,
    summary: `Actualizó usuario ${(row as User).email}`,
    metadata: data as Record<string, unknown>,
  });
  return stripPassword(row as User);
}

export async function changePassword(
  actor: { id: string; email: string; role: Role },
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(actor.id);
  if (!user) throw new NotFoundError('Usuario no encontrado');
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) throw new BadRequestError('Contraseña actual incorrecta');
  if (actor.id === 'seed-admin') {
    throw new BadRequestError('Ejecuta el bootstrap antes de cambiar tu contraseña');
  }
  const hash = await bcrypt.hash(newPassword, 10);
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  await sb.from('users').update({ password_hash: hash, must_change_password: false }).eq('id', actor.id);
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'change_password',
    entity: 'user',
    entity_id: actor.id,
    summary: 'Cambió su contraseña',
  });
}

// ===================== PRODUCTS =====================

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  let q = sb.from('products').select('*').order('name');
  if (filters?.onlyActive !== false) q = q.eq('is_active', true);
  if (filters?.search) q = q.ilike('name', `%${filters.search}%`);
  const { data } = await q;
  return (data as Product[]) ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  return (data as Product) ?? null;
}

export async function getProductByName(name: string): Promise<Product | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data } = await sb
    .from('products')
    .select('*')
    .ilike('name', name.trim())
    .eq('is_active', true)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function createProduct(
  actor: { id: string; email: string; role: Role },
  data: CreateProductRequest
): Promise<Product> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const { data: row, error } = await sb
    .from('products')
    .insert({
      name: data.name.trim(),
      price: data.price,
      current_stock: data.current_stock,
      created_by: actor.id === 'seed-admin' ? null : actor.id,
      updated_by: actor.id === 'seed-admin' ? null : actor.id,
    })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') throw new ConflictError('Ya existe un producto activo con ese nombre');
    throw new AppError(500, error.message);
  }
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'create_product',
    entity: 'product',
    entity_id: (row as Product).id,
    summary: `Creó producto ${data.name}`,
    metadata: { price: data.price, current_stock: data.current_stock },
  });
  return row as Product;
}

export async function updateProductPrice(
  actor: { id: string; email: string; role: Role },
  id: string,
  price: number
): Promise<Product> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const { data: row, error } = await sb
    .from('products')
    .update({
      price,
      updated_by: actor.id === 'seed-admin' ? null : actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !row) throw new NotFoundError('Producto no encontrado');
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'update_price',
    entity: 'product',
    entity_id: id,
    summary: `Cambió precio de ${(row as Product).name} a ${price}`,
  });
  return row as Product;
}

export async function updateProductStock(
  actor: { id: string; email: string; role: Role },
  id: string,
  addQty: number
): Promise<Product> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const product = await getProductById(id);
  if (!product) throw new NotFoundError('Producto no encontrado');
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const newStock = product.current_stock + addQty;
  const { data: row, error } = await sb
    .from('products')
    .update({
      current_stock: newStock,
      updated_by: actor.id === 'seed-admin' ? null : actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new AppError(500, error.message);
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'update_stock',
    entity: 'product',
    entity_id: id,
    summary: `Agregó ${addQty} unidades a ${product.name} (stock: ${newStock})`,
  });
  return row as Product;
}

export async function deactivateProduct(
  actor: { id: string; email: string; role: Role },
  id: string
): Promise<Product> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');
  const { data: row, error } = await sb
    .from('products')
    .update({
      is_active: false,
      updated_by: actor.id === 'seed-admin' ? null : actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !row) throw new NotFoundError('Producto no encontrado');
  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'deactivate_product',
    entity: 'product',
    entity_id: id,
    summary: `Desactivó producto ${(row as Product).name}`,
  });
  return row as Product;
}

// ===================== SALES =====================

export async function registerSale(
  actor: { id: string; email: string; role: Role },
  data: RegisterSaleRequest
): Promise<Sale> {
  const product = await getProductById(data.productId);
  if (!product || !product.is_active) {
    throw new NotFoundError('Producto no encontrado o inactivo');
  }
  if (product.current_stock < data.quantity) {
    throw new ConflictError('Stock insuficiente', {
      available: product.current_stock,
      requested: data.quantity,
    });
  }
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');

  const { error: stockError } = await sb
    .from('products')
    .update({ current_stock: product.current_stock - data.quantity, updated_at: new Date().toISOString() })
    .eq('id', product.id);
  if (stockError) throw new AppError(500, stockError.message);

  const unitPrice = Number(product.price);
  const total = unitPrice * data.quantity;
  const { data: sale, error } = await sb
    .from('sales')
    .insert({
      product_id: product.id,
      sold_by: actor.id === 'seed-admin' ? null : actor.id,
      quantity: data.quantity,
      unit_price: unitPrice,
      total,
    })
    .select('*')
    .single();
  if (error) {
    await sb.from('products').update({ current_stock: product.current_stock }).eq('id', product.id);
    throw new AppError(500, error.message);
  }

  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'register_sale',
    entity: 'sale',
    entity_id: (sale as Sale).id,
    summary: `Venta: ${data.quantity} x ${product.name} = ${total}`,
    metadata: { product_id: product.id, quantity: data.quantity, total },
  });
  return sale as Sale;
}

async function attachProducts(rows: Sale[]): Promise<SaleWithProduct[]> {
  if (rows.length === 0) return [];
  const sb = getSupabaseClient();
  if (!sb) return rows.map((r) => ({ ...r, product_name: '', seller_name: null }));
  const productIds = Array.from(new Set(rows.map((r) => r.product_id)));
  const userIds = Array.from(new Set(rows.map((r) => r.sold_by).filter(Boolean) as string[]));
  const [{ data: products }, { data: users }] = await Promise.all([
    sb.from('products').select('id, name').in('id', productIds),
    userIds.length
      ? sb.from('users').select('id, name').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const pmap = new Map((products ?? []).map((p) => [p.id, p.name]));
  const umap = new Map((users ?? []).map((u) => [u.id, u.name]));
  return rows.map((r) => ({
    ...r,
    product_name: pmap.get(r.product_id) ?? '(desconocido)',
    seller_name: r.sold_by ? umap.get(r.sold_by) ?? null : null,
  }));
}

export async function getTodaySales(): Promise<SaleWithProduct[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { start, end } = todayRangeUTC();
  const { data } = await sb
    .from('sales')
    .select('*')
    .gte('sold_at', start)
    .lt('sold_at', end)
    .order('sold_at', { ascending: false });
  return attachProducts((data as Sale[]) ?? []);
}

export async function getSales(filters?: SaleFilters): Promise<SaleWithProduct[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  let q = sb.from('sales').select('*').order('sold_at', { ascending: false });
  if (filters?.from) q = q.gte('sold_at', filters.from);
  if (filters?.to) q = q.lt('sold_at', filters.to);
  if (filters?.productId) q = q.eq('product_id', filters.productId);
  const { data } = await q;
  return attachProducts((data as Sale[]) ?? []);
}

export async function getDailySummary(): Promise<DailySummary> {
  const sales = await getTodaySales();
  const totalSales = sales.length;
  const totalIncome = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const counts = new Map<string, number>();
  for (const s of sales) {
    counts.set(s.product_name, (counts.get(s.product_name) ?? 0) + s.quantity);
  }
  let topProduct: DailySummary['topProduct'] = null;
  for (const [name, quantity] of counts) {
    if (!topProduct || quantity > topProduct.quantity) topProduct = { name, quantity };
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    totalSales,
    totalIncome,
    topProduct,
  };
}

export async function deleteSale(
  actor: { id: string; email: string; role: Role },
  saleId: string
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');

  // Get the sale to restore stock
  const { data: sale, error: saleError } = await sb
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .maybeSingle();
  if (saleError || !sale) {
    throw new NotFoundError('Venta no encontrada');
  }

  // Get the product to restore its stock
  const { data: product, error: productError } = await sb
    .from('products')
    .select('current_stock')
    .eq('id', (sale as Sale).product_id)
    .maybeSingle();
  if (productError || !product) {
    throw new NotFoundError('Producto no encontrado');
  }

  // Restore stock
  const { error: updateError } = await sb
    .from('products')
    .update({
      current_stock: product.current_stock + (sale as Sale).quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', (sale as Sale).product_id);
  if (updateError) throw new AppError(500, updateError.message);

  // Delete the sale
  const { error: deleteError } = await sb
    .from('sales')
    .delete()
    .eq('id', saleId);
  if (deleteError) {
    // Rollback stock restoration
    await sb
      .from('products')
      .update({ current_stock: product.current_stock, updated_at: new Date().toISOString() })
      .eq('id', (sale as Sale).product_id);
    throw new AppError(500, deleteError.message);
  }

  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'delete_sale',
    entity: 'sale',
    entity_id: saleId,
    summary: `Venta eliminada y stock restaurado: ${(sale as Sale).quantity} unidades`,
    metadata: { product_id: (sale as Sale).product_id, quantity: (sale as Sale).quantity },
  });
}

export async function updateSale(
  actor: { id: string; email: string; role: Role },
  saleId: string,
  data: UpdateSaleRequest
): Promise<Sale> {
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible');

  if (data.quantity !== undefined && data.quantity < 1) {
    throw new BadRequestError('La cantidad debe ser mayor a 0');
  }

  // Get the sale
  const { data: sale, error: saleError } = await sb
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .maybeSingle();
  if (saleError || !sale) {
    throw new NotFoundError('Venta no encontrada');
  }

  const saleData = sale as Sale;
  const oldQuantity = saleData.quantity;
  const newQuantity = data.quantity ?? oldQuantity;
  const quantityDifference = newQuantity - oldQuantity;

  // If quantity changed, check and update stock
  if (quantityDifference !== 0) {
    const { data: product, error: productError } = await sb
      .from('products')
      .select('current_stock')
      .eq('id', saleData.product_id)
      .maybeSingle();
    if (productError || !product) {
      throw new NotFoundError('Producto no encontrado');
    }

    if (quantityDifference > 0 && product.current_stock < quantityDifference) {
      throw new ConflictError('Stock insuficiente para aumentar la cantidad');
    }

    // Update stock
    const { error: stockError } = await sb
      .from('products')
      .update({
        current_stock: product.current_stock - quantityDifference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', saleData.product_id);
    if (stockError) throw new AppError(500, stockError.message);
  }

  // Update the sale
  const newTotal = Number(saleData.unit_price) * newQuantity;
  const { data: updated, error: updateError } = await sb
    .from('sales')
    .update({ quantity: newQuantity, total: newTotal, updated_at: new Date().toISOString() })
    .eq('id', saleId)
    .select('*')
    .single();
  if (updateError) {
    // Rollback stock if we updated it
    if (quantityDifference !== 0) {
      const { data: product } = await sb
        .from('products')
        .select('current_stock')
        .eq('id', saleData.product_id)
        .maybeSingle();
      if (product) {
        await sb
          .from('products')
          .update({
            current_stock: product.current_stock + quantityDifference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', saleData.product_id);
      }
    }
    throw new AppError(500, updateError.message);
  }

  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'update_sale',
    entity: 'sale',
    entity_id: saleId,
    summary: `Venta actualizada: ${oldQuantity} → ${newQuantity} unidades`,
    metadata: { product_id: saleData.product_id, old_quantity: oldQuantity, new_quantity: newQuantity },
  });

  return updated as Sale;
}

export async function getDashboardData(): Promise<DashboardData> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return {
      mode,
      summary: { date: new Date().toISOString().slice(0, 10), totalSales: 0, totalIncome: 0, topProduct: null },
      lowStock: [],
      lastSale: null,
    };
  }
  const [summary, products, lastSales] = await Promise.all([
    getDailySummary(),
    getProducts({ onlyActive: true }),
    getSales({}),
  ]);
  const lowStock = products
    .filter((p) => p.current_stock < 5)
    .map((p) => ({ id: p.id, name: p.name, current_stock: p.current_stock }));
  const last = lastSales[0] ?? null;
  return {
    mode,
    summary,
    lowStock,
    lastSale: last
      ? {
          product_name: last.product_name,
          quantity: last.quantity,
          total: Number(last.total),
          sold_at: last.sold_at,
        }
      : null,
  };
}

// ===================== BOOTSTRAP =====================

export async function bootstrap(actor: { id: string; email: string; role: Role }): Promise<{
  appliedMigrations: string[];
  seededAdmin: boolean;
  seededProducts: number;
}> {
  if (actor.role !== 'admin') throw new ForbiddenError();
  const appliedMigrations = await runPendingMigrations();
  invalidateModeCache();
  const sb = getSupabaseClient();
  if (!sb) throw new AppError(503, 'Supabase no disponible tras migrations');

  // Insert admin from seed if not exists
  const seed = readSeed();
  let seededAdmin = false;
  for (const u of seed.users) {
    const { data: existing } = await sb
      .from('users')
      .select('id')
      .ilike('email', u.email)
      .maybeSingle();
    if (existing) continue;
    const hash = await bcrypt.hash(u.password_plain, 10);
    await sb.from('users').insert({
      name: u.name,
      email: u.email.toLowerCase(),
      password_hash: hash,
      role: u.role,
      is_active: true,
      must_change_password: true,
    });
    seededAdmin = true;
  }

  // Insert demo products if products table is empty
  const { count } = await sb.from('products').select('*', { count: 'exact', head: true });
  let seededProducts = 0;
  if ((count ?? 0) === 0) {
    const { data: adminRow } = await sb
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();
    for (const p of seed.products) {
      const { error } = await sb.from('products').insert({
        name: p.name,
        price: p.price,
        current_stock: p.current_stock,
        created_by: adminRow?.id ?? null,
        updated_by: adminRow?.id ?? null,
      });
      if (!error) seededProducts++;
    }
  }

  await recordAudit({
    user_id: actor.id,
    user_email: actor.email,
    user_role: actor.role,
    action: 'bootstrap',
    entity: 'system',
    summary: `Bootstrap ejecutado (${appliedMigrations.length} migrations, ${seededProducts} productos)`,
    metadata: { appliedMigrations, seededProducts, seededAdmin },
  });

  return { appliedMigrations, seededAdmin, seededProducts };
}

export async function diagnose(): Promise<{
  mode: SystemMode;
  supabase: { configured: boolean };
  migrations: { applied: number };
  counts: { users: number; products: number; sales: number };
}> {
  const sb = getSupabaseClient();
  const mode = await getSystemMode();
  if (!sb) {
    return {
      mode,
      supabase: { configured: false },
      migrations: { applied: 0 },
      counts: { users: 0, products: 0, sales: 0 },
    };
  }
  const [users, products, sales] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('products').select('*', { count: 'exact', head: true }),
    sb.from('sales').select('*', { count: 'exact', head: true }),
  ]);
  const migrationsApplied = await countMigrationsApplied().catch(() => 0);
  return {
    mode,
    supabase: { configured: true },
    migrations: { applied: migrationsApplied },
    counts: {
      users: users.count ?? 0,
      products: products.count ?? 0,
      sales: sales.count ?? 0,
    },
  };
}
