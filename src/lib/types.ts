/**
 * Tipos TypeScript para la aplicación
 * Se corresponden con las tablas en PostgreSQL
 * 
 * Conversión: camelCase (TS) ↔ snake_case (PostgreSQL)
 */

/**
 * Tabla: pages
 * Almacena contenido de páginas (heroes, secciones, etc.)
 */
export interface Page {
  id: string;
  name: string; // Ej: "home"
  title: string;
  subtitle: string;
  description: string;
  effect?: string; // Ej: "glow-pulse"
  createdAt: string;
  updatedAt: string;
}

/**
 * Tabla: products (ejemplo para stock/inventario)
 * Si tu proyecto es un stock control, aquí van los productos
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tabla: users (ejemplo para autenticación futura)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}
