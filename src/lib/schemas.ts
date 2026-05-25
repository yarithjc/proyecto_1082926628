import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['cajero', 'admin']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['cajero', 'admin']).optional(),
  is_active: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(150),
  price: z.number().positive(),
  current_stock: z.number().int().min(0),
});

export const updateProductPriceSchema = z.object({
  price: z.number().positive(),
});

export const updateProductStockSchema = z.object({
  quantity: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
});

export const registerSaleSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});
