# StockControl — Plan Maestro del Sistema
> Sistema de Inventario y Ventas para Salsamentarías | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Yarith Jiménez | Doc: 1082926628

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**StockControl** es una aplicación web de gestión de inventario y ventas diseñada para salsamentarías y pequeños negocios de alimentos. Permite registrar productos con su precio y cantidad disponible, registrar ventas con descuento automático del inventario, buscar productos y consultar el historial completo de ventas del negocio.

El sistema opera completamente desde el navegador con Next.js App Router en Vercel. Persiste todos los datos en Supabase Postgres y registra la auditoría de operaciones en Vercel Blob.

La adaptación del modelo original (menú interactivo de terminal) al entorno web no cambia la lógica del negocio — mantiene exactamente las mismas reglas y operaciones, ahora accesibles desde cualquier dispositivo con conexión a internet.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve StockControl |
|---|---|
| Inventario manejado en cuadernos o Excel, propenso a errores. | Inventario digital con actualización automática en cada venta. |
| Pérdidas por productos agotados sin saberlo. | Vista de inventario en tiempo real con alerta visual cuando el stock está bajo. |
| Dificultad para llevar registro claro de ventas. | Historial persistente de ventas con fecha, producto, cantidad y valor total. |
| Control manual propenso a errores en el conteo de existencias. | Validación automática de stock antes de permitir cada venta. |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Cajero / Empleado** | Interno | Registra ventas, consulta el inventario y busca productos. |
| **Administrador / Propietario** | Interno | Acceso completo. Agrega, edita y desactiva productos. Ve el historial completo. Gestiona usuarios. |
| **Sistema** | No humano | Descuenta stock automáticamente al registrar ventas. Calcula totales. Registra auditoría. |

> **No hay registro público.** Los usuarios (cajeros y admin) los crea el administrador del sistema. Un empleado no puede crear su propia cuenta.

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Cajero | Admin |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **PRODUCTOS** | | |
| Ver inventario completo | ✅ | ✅ |
| Buscar producto por nombre | ✅ | ✅ |
| Agregar nuevo producto | ❌ | ✅ |
| Editar precio de un producto | ❌ | ✅ |
| Actualizar cantidad disponible (entrada de mercancía) | ❌ | ✅ |
| Desactivar producto | ❌ | ✅ |
| **VENTAS** | | |
| Registrar venta | ✅ | ✅ |
| Ver historial de ventas del día | ✅ | ✅ |
| Ver historial completo de ventas | ❌ | ✅ |
| **USUARIOS** | | |
| Crear / editar / suspender usuarios | ❌ | ✅ |
| **AUDITORÍA** | | |
| Ver bitácora de operaciones | ❌ | ✅ |

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Ingresa correo y contraseña. El sistema valida y redirige al panel correspondiente al rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Módulo de Inventario

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Agregar producto | Admin | Registra nombre (único), precio y cantidad inicial. |
| CU-02 | Ver inventario | Cajero / Admin | Lista todos los productos activos con nombre, precio y cantidad disponible. Muestra alerta visual si el stock está en 0 o es muy bajo (< 5 unidades). |
| CU-03 | Buscar producto | Cajero / Admin | Busca por nombre (búsqueda parcial, sin importar mayúsculas) y muestra el resultado con toda su información. |
| CU-04 | Editar precio | Admin | Actualiza el precio unitario de un producto. |
| CU-05 | Actualizar stock | Admin | Agrega unidades a un producto al recibir nueva mercancía. |
| CU-06 | Desactivar producto | Admin | Marca el producto como inactivo. No aparece en el inventario activo ni en ventas. El historial de ventas previas lo conserva. |

### Módulo de Ventas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-07 | Registrar venta | Cajero / Admin | Selecciona el producto (por nombre o buscador), ingresa la cantidad. El sistema valida el stock, descuenta y registra la venta con su total. |
| CU-08 | Ver historial del día | Cajero / Admin | Lista las ventas del día en curso con producto, cantidad, valor unitario y total. |
| CU-09 | Ver historial completo | Admin | Lista todas las ventas con filtros por fecha y por producto. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El usuario puede agregar nuevos productos registrando nombre, precio y cantidad disponible. |
| RF-02 | El usuario puede consultar el inventario completo con todos los productos activos y su información actualizada. |
| RF-03 | El usuario puede registrar una venta indicando el producto y la cantidad vendida. |
| RF-04 | El sistema descuenta automáticamente la cantidad vendida del inventario al registrar una venta. |
| RF-05 | El sistema valida que haya suficiente stock antes de permitir una venta. |
| RF-06 | El usuario puede actualizar el precio de un producto. |
| RF-07 | El usuario puede actualizar la cantidad disponible de un producto al recibir mercancía. |
| RF-08 | El sistema mantiene un historial persistente de ventas con fecha, producto, cantidad y valor total. |
| RF-09 | El usuario puede buscar un producto por nombre para consultar su información. |
| RF-10 | El sistema muestra alerta visual cuando un producto tiene stock igual a 0 o menor a 5 unidades. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | El stock de un producto no puede quedar en negativo. Si la cantidad a vender supera el stock, la venta es rechazada. | Verificar `products.current_stock >= quantity` en `dataService.registerSale()` antes de insertar. Retornar 409 con el stock actual disponible. |
| RN-02 | El nombre de un producto debe ser único. | UNIQUE en `products.name` (case-insensitive con `LOWER(name)`). Capturar el error de unicidad de Postgres y retornar 409. |
| RN-03 | El precio de un producto debe ser un número positivo mayor a cero. | Validación Zod: `z.number().positive()`. CHECK en Postgres: `price > 0`. |
| RN-04 | La cantidad a vender debe ser un número entero positivo mayor a cero. | Validación Zod: `z.number().int().min(1)`. |
| RN-05 | No se puede registrar una venta de un producto que no exista o esté inactivo. | Verificar `products.is_active = true` en `dataService.registerSale()`. Retornar 404 si no existe o está inactivo. |
| RN-06 | La cantidad inicial al agregar un producto no puede ser negativa. | Validación Zod: `z.number().int().min(0)`. |
| RN-07 | Un producto desactivado no aparece en el inventario activo ni puede recibir ventas. | Filtrar `WHERE is_active = true` en todas las queries de inventario y ventas. |
| RN-08 | El sistema siempre registra el precio unitario vigente al momento de la venta en el historial. | Guardar `unit_price` como snapshot en la tabla `sales` — no referenciar el precio actual del producto. Si el precio cambia después, las ventas anteriores conservan el precio original. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only de operaciones |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, productos, ventas. | El inventario necesita transacciones confiables — un fallo entre el descuento de stock y el registro de venta no puede dejar datos inconsistentes. |
| **Vercel Blob** | Auditoría de operaciones del admin (`audit/<YYYYMM>.json`). | Logs append-only sin necesidad de SQL. |
| **`data/` en el repo** | Seed inicial: admin + productos de demo. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **CERO caché en memoria** para datos transaccionales. El inventario cambia con cada venta.
3. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
6. **`registerSale` es una operación secuencial en el servidor**: verificar stock → descontar → insertar venta. Nunca el cliente controla el stock.
7. **Snapshot de precio** (RN-08): `sales.unit_price` se copia del precio vigente al momento de la venta. Un cambio de precio posterior no altera el historial.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "StockControl" }
  seed.json       ← {
                      "users": [{
                        email: "admin@stockcontrol.com",
                        password_hash: "<bcrypt de admin123>",
                        name: "Administrador",
                        role: "admin"
                      }],
                      "products": [
                        { name: "Salchichón", price: 8500, current_stock: 50 },
                        { name: "Queso Costeño", price: 12000, current_stock: 30 },
                        { name: "Mortadela", price: 6500, current_stock: 40 }
                      ]
                    }
  README.md
```

> Los productos de demo permiten que la aplicación sea usable desde el primer bootstrap sin que el admin tenga que crear todo desde cero.

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql       ← Fase 1: users + _migrations
  0002_init_products.sql    ← Fase 3: products
  0003_init_sales.sql       ← Fase 4: sales
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 Página `/admin/db-setup`

Tab **Diagnóstico**: estado de Supabase, Blob, migrations, conteos por tabla.
Tab **Bootstrap**: migrations pendientes + botón ejecutar con confirmación. El bootstrap también inserta los 3 productos de demo.

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts       ← ÚNICO punto de acceso
  supabase.ts          ← Solo lo importa dataService
  blobAudit.ts         ← Solo lo importa dataService
  pgMigrate.ts         ← Solo lo importa /api/system/bootstrap
  seedReader.ts        ← Solo lo importa dataService en modo seed
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Productos
export async function getProducts(filters?: ProductFilters): Promise<Product[]>
export async function getProductById(id: string): Promise<Product | null>
export async function getProductByName(name: string): Promise<Product | null>
export async function createProduct(userId: string, data: CreateProductRequest): Promise<Product>
export async function updateProductPrice(id: string, userId: string, price: number): Promise<Product>
export async function updateProductStock(id: string, userId: string, quantity: number): Promise<Product>
export async function deactivateProduct(id: string, userId: string): Promise<Product>

// Ventas
export async function registerSale(userId: string, data: RegisterSaleRequest): Promise<Sale>
export async function getSales(filters?: SaleFilters): Promise<SaleWithProduct[]>
export async function getTodaySales(userId?: string): Promise<SaleWithProduct[]>
export async function getDailySummary(): Promise<DailySummary>

// Dashboard
export async function getDashboardData(): Promise<DashboardData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica: `registerSale`

```typescript
export async function registerSale(userId: string, data: RegisterSaleRequest): Promise<Sale> {
  const { productId, quantity } = data;

  // 1. Obtener el producto verificando que existe y está activo (RN-05, RN-07)
  const product = await getProductById(productId);
  if (!product || !product.is_active) {
    throw new NotFoundError('Producto no encontrado o inactivo');
  }

  // 2. Verificar stock suficiente (RN-01)
  if (product.current_stock < quantity) {
    throw new ConflictError('Stock insuficiente', {
      available: product.current_stock,
      requested: quantity
    });
  }

  // 3. Descontar del inventario
  await supabase
    .from('products')
    .update({ current_stock: product.current_stock - quantity })
    .eq('id', productId);

  // 4. Registrar la venta con snapshot de precio (RN-08)
  const { data: sale } = await supabase
    .from('sales')
    .insert({
      product_id: productId,
      sold_by: userId,
      quantity,
      unit_price: product.price,          // snapshot del precio vigente
      total: product.price * quantity,
    })
    .select()
    .single();

  // 5. Registrar auditoría
  await recordAudit({
    action: 'register_sale',
    entity: 'sale',
    entity_id: sale.id,
    summary: `Venta: ${quantity} x ${product.name} = $${(product.price * quantity).toLocaleString('es-CO')}`,
  });

  return sale;
}
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──< products (created_by)
users ──< products (updated_by)
users ──< sales (sold_by)
products ──< sales (product_id)
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'cajero'
                       CHECK (role IN ('cajero', 'admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_products.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  price         DECIMAL(10,2) NOT NULL CHECK (price > 0),  -- RN-03
  current_stock INTEGER       NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  is_active     BOOLEAN       DEFAULT true,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- RN-02: nombre único (insensible a mayúsculas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique
  ON products(LOWER(name))
  WHERE is_active = true;  -- solo entre productos activos

CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock  ON products(current_stock);
```

> **Nota sobre el UNIQUE parcial en `products.name`**: el índice aplica solo a productos activos (`WHERE is_active = true`). Si un producto se desactiva, su nombre puede volver a usarse en un producto nuevo. Esto refleja la realidad del negocio: si un producto deja de venderse, puede que después se retome con el mismo nombre.

### Migration `0003_init_sales.sql`

```sql
CREATE TABLE IF NOT EXISTS sales (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID          NOT NULL REFERENCES products(id),
  sold_by     UUID          REFERENCES users(id) ON DELETE SET NULL,
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),   -- RN-04
  unit_price  DECIMAL(10,2) NOT NULL,   -- snapshot del precio al momento de vender (RN-08)
  total       DECIMAL(12,2) NOT NULL,   -- quantity * unit_price
  sold_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product  ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date     ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by  ON sales(sold_by);
```

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'cajero' | 'admin';
  action:
    | 'login' | 'logout'
    | 'create_product' | 'update_price' | 'update_stock' | 'deactivate_product'
    | 'register_sale'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'product' | 'sale' | 'user' | 'system';
  entity_id?: string;
  summary: string;  // "Venta: 3 x Salchichón = $25.500"
  metadata?: Record<string, unknown>;
};
```

### 13.2 Implementación de `lib/blobAudit.ts`

Idéntica al patrón de todos los proyectos del curso:
- `getBlobToken()` lazy — nunca constante de módulo.
- `get()` del SDK de Blob — nunca `fetch(url)` para blobs privados.
- `withFileLock()` para serializar read-modify-write al mismo archivo mensual.

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                       ← Redirige a /dashboard o /login
  login/page.tsx                 ← Sin link de registro (usuarios los crea el admin)
  dashboard/page.tsx             ← Panel principal: resumen del día + acceso rápido
  inventory/
    page.tsx                     ← Lista de productos con stock y alertas
    new/page.tsx                 ← Agregar producto (solo admin)
    [id]/page.tsx                ← Detalle del producto con historial de ventas
    [id]/edit/page.tsx           ← Editar precio y stock (solo admin)
  sales/
    page.tsx                     ← Formulario de venta + historial del día
    history/page.tsx             ← Historial completo con filtros (solo admin)
  profile/page.tsx               ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    products/
      route.ts                   ← GET lista | POST crear (admin)
      [id]/route.ts              ← GET | PATCH precio | PATCH stock | DELETE soft
      search/route.ts            ← GET búsqueda por nombre
    sales/
      route.ts                   ← POST registrar | GET historial del día
      history/route.ts           ← GET historial completo con filtros (admin)
      summary/route.ts           ← GET resumen del día (total ventas, ingresos)
    dashboard/route.ts
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                        ← AppLayout, Sidebar, SeedModeBanner
  inventory/                     ← ProductCard, ProductTable, StockBadge,
                                    ProductForm, LowStockAlert
  sales/                         ← SaleForm, SaleRow, DailySummary
  admin/                         ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El inventario debe reflejar el stock actualizado en menos de 1 segundo después de cada venta. |
| RNF-02 | El registro de una venta (validación + descuento + registro) debe completarse en menos de 1 segundo. |
| RNF-03 | La interfaz debe ser completamente funcional en celulares (muchos cajeros trabajan desde el celular). |
| RNF-04 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-05 | Las sesiones deben gestionarse con JWT en cookie HttpOnly. |
| RNF-06 | Los precios deben mostrarse en formato moneda colombiana (COP) en toda la interfaz. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que todos los proyectos del curso: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo. El bootstrap inserta los 3 productos de demo.

### Flujo de registro de venta (cajero)

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Dashboard / Ventas | El cajero abre la sección de ventas o hace clic en "Nueva venta". |
| 2 | Formulario de venta | Busca el producto escribiendo su nombre. El buscador muestra resultados en tiempo real (debounce). |
| 3 | Formulario de venta | Selecciona el producto. El sistema muestra el stock actual y el precio. |
| 4 | Formulario de venta | Ingresa la cantidad. El sistema calcula el total automáticamente. |
| 5 | Confirmación | El cajero revisa: producto, cantidad, precio y total. Hace clic en "Registrar venta". |
| 6 | Sistema | Verifica stock (RN-01), descuenta del inventario, registra la venta con snapshot del precio (RN-08), registra auditoría. |
| 7 | Resultado | Toast verde: "✓ Venta registrada — $XX.XXX". El formulario se limpia para la siguiente venta. |

### Flujo de stock insuficiente (RN-01)

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Cajero | Intenta vender 10 unidades de Mortadela con solo 3 en stock. |
| 2 | Sistema (cliente) | Calcula el total (muestra número en rojo si supera el stock). |
| 3 | Sistema (servidor) | Verifica stock: `3 < 10` → retorna 409 con `{ available: 3, requested: 10 }`. |
| 4 | Frontend | Muestra alerta: "Stock insuficiente. Hay 3 unidades disponibles." Sin procesar la venta. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

StockControl es una herramienta de trabajo diario para un pequeño negocio. El login es simple, directo y profesional — sin elementos decorativos innecesarios.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado vertical y horizontalmente. |
| **Fondo** | Rojo oscuro (`#7F1D1D`) con textura sutil de patrón geométrico muy leve. Evoca el ambiente de una salsamentaría. |
| **Tarjeta** | Fondo blanco puro, `border-radius: 12px`, sombra roja suave, borde izquierdo de 4px en rojo carne (`#DC2626`), max-w-sm. |
| **Logo** | SVG inline de un cuchillo de carnicería estilizado con un cuadro de verificación superpuesto, en rojo carne (`#DC2626`), 48×48px. |
| **Nombre** | "StockControl" en Inter Bold 28px, gris oscuro (`#1C1917`). |
| **Tagline** | "Inventario y ventas para tu negocio." Inter Regular 13px, gris medio (`#78716C`). |
| **Campos** | Borde gris cálido (`#D6D3D1`), focus en rojo carne (`#DC2626`). |
| **Botón principal** | "Ingresar" — rojo carne `#DC2626`, texto blanco, hover `#B91C1C`. |
| **Pie** | "StockControl — Salsamentaría". Sin link de "Crear cuenta". |
| **Animación** | Framer Motion: tarjeta con `opacity: 0→1` y `scale: 0.97→1`, duración 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (rojo carne) | `#DC2626` |
| Primario oscuro | `#B91C1C` |
| Primario claro | `#FEE2E2` |
| Fondo principal | `#FAFAF9` (stone 50) |
| Fondo de tarjetas | `#FFFFFF` |
| Fondo alterno | `#F5F5F4` (stone 100) |
| Texto principal | `#1C1917` (stone 900) |
| Texto secundario | `#78716C` (stone 500) |
| Stock OK | `#16A34A` + fondo `#F0FDF4` |
| Stock bajo (< 5) | `#D97706` + fondo `#FFFBEB` |
| Stock agotado (0) | `#DC2626` + fondo `#FEF2F2` |
| Venta exitosa | `#16A34A` |
| Error | `#DC2626` |
| Bordes | `#E7E5E4` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Tipografía

Inter para todo. Títulos: 24px Bold. Secciones: 18px SemiBold. Cuerpo: 14px Regular. Precios: 16px Medium con formato `$XX.XXX` (pesos colombianos).

### Componentes clave

| Componente | Descripción |
|---|---|
| `ProductCard` | Tarjeta de producto: nombre, precio en COP, stock con `StockBadge`. En móvil se muestra como tarjeta; en desktop como fila de tabla. |
| `StockBadge` | Badge de stock: verde (>= 5), naranja (1–4), rojo con "AGOTADO" (0). |
| `LowStockAlert` | Banner naranja en el dashboard y en el inventario cuando hay productos con stock < 5. Lista los productos en alerta. |
| `SaleForm` | Formulario compacto: buscador de producto con autocompletado, input de cantidad, total calculado en tiempo real, botón "Registrar venta". |
| `DailySummary` | Tarjetas en el dashboard: total de ventas del día, ingresos del día (suma de totales), producto más vendido del día. |
| `SaleRow` | Fila en el historial: hora, producto, cantidad, precio unitario, total. |
| `SeedModeBanner` | Banner amarillo estándar. Solo admin. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. Inventario en tabla. `SaleForm` en panel lateral. |
| Tablet (768–1023px) | Sidebar colapsable. Inventario en tabla con columnas reducidas. |
| Celular (<768px) | Bottom navigation (Dashboard, Inventario, Vender, Perfil). Inventario en cards. `SaleForm` en pantalla completa. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel. Configurar variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin (password `admin123` hasheado con bcrypt 10 rounds) y los 3 productos de demo. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. `withAuth` agrega `Cache-Control: no-store`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | Crear `lib/types.ts` y `lib/schemas.ts`. |
| 1.10 | Crear API Routes de sistema y auth: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.11 | Crear `app/login/page.tsx` con la identidad visual de StockControl: fondo rojo oscuro, tarjeta blanca, logo de cuchillo, sin link de registro. |
| 1.12 | Actualizar `app/page.tsx`: redirige a `/dashboard` o `/login`. |
| 1.13 | `npm run typecheck` sin errores. Probar: login admin del seed → cookie HttpOnly → modo seed. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). Cajero ve: Dashboard, Inventario, Vender, Perfil. Admin ve además Administración. |
| 2.4 | Crear `/admin/db-setup/page.tsx`: diagnóstico + bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `GET /api/dashboard`: total ventas del día, ingresos del día, productos con stock bajo (< 5), último producto vendido. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx`: `DailySummary` con los 3 datos principales, `LowStockAlert` si hay productos con poco stock, botón grande "Registrar venta". |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para admin. |
| 2.9 | Probar: bootstrap → modo live → productos de demo en el diagnóstico. |

---

### Fase 3 — Módulo de Inventario
> Rol: Ingeniero Fullstack — Gestión completa de productos

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_products.sql` con el índice UNIQUE parcial en `LOWER(name) WHERE is_active = true`. Aplicar desde `/admin/db-setup`. |
| 3.2 | El bootstrap también inserta los 3 productos de demo del seed en `products`. |
| 3.3 | Agregar tipos `Product`, `CreateProductRequest`, `UpdateProductRequest` y schemas Zod (RN-03, RN-06). |
| 3.4 | Extender `dataService`: `getProducts` (filtrar por `is_active = true`, ordenar por nombre), `getProductById`, `getProductByName` (búsqueda con `ILIKE %name%`), `createProduct` (captura error de UNIQUE y retorna 409 — RN-02), `updateProductPrice` (RN-03 — precio > 0), `updateProductStock` (suma al stock actual — no reemplaza), `deactivateProduct`. Cada escritura llama `recordAudit`. |
| 3.5 | API Routes: `GET/POST /api/products`, `GET /api/products/search?q=nombre`, `GET/PATCH /api/products/[id]`, `DELETE /api/products/[id]` (soft delete — admin). |
| 3.6 | Crear `app/inventory/page.tsx`: tabla/cards de productos con `StockBadge`. Barra de búsqueda en la parte superior. `LowStockAlert` si hay productos con stock < 5. Botón "Agregar producto" solo visible para admin. |
| 3.7 | Crear `app/inventory/new/page.tsx` (solo admin): formulario de nuevo producto. |
| 3.8 | Crear `app/inventory/[id]/page.tsx`: detalle del producto con historial de ventas de ese producto. |
| 3.9 | Crear `app/inventory/[id]/edit/page.tsx` (solo admin): formulario para editar precio y cantidad. |
| 3.10 | Verificar RN-02: crear dos productos con el mismo nombre → segundo debe retornar 409. |

---

### Fase 4 — Módulo de Ventas
> Rol: Ingeniero Fullstack — Flujo de venta y historial

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_sales.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Sale`, `SaleWithProduct`, `RegisterSaleRequest`, `DailySummary` y schemas Zod (RN-04). |
| 4.3 | Extender `dataService`: `registerSale` (secuencia completa: verificar activo → verificar stock → descontar → insertar con snapshot de precio → auditoría), `getSales`, `getTodaySales`, `getDailySummary`. |
| 4.4 | API Routes: `POST /api/sales` (ambos roles), `GET /api/sales` (historial del día — ambos roles), `GET /api/sales/history?from=&to=&productId=` (admin), `GET /api/sales/summary` (ambos roles). |
| 4.5 | Crear `app/sales/page.tsx`: dos secciones. Izquierda: `SaleForm` con buscador de producto y input de cantidad. Derecha: historial del día en tiempo real. |
| 4.6 | `SaleForm`: buscador con debounce 300ms llama a `/api/products/search`. Al seleccionar un producto, muestra stock actual y precio. Al ingresar cantidad, calcula y muestra el total automáticamente. Si la cantidad supera el stock, deshabilita el botón y muestra advertencia en naranja. |
| 4.7 | Al confirmar la venta exitosa: toast verde con el total, limpiar el formulario, actualizar el historial del día sin recargar la página. |
| 4.8 | Crear `app/sales/history/page.tsx` (solo admin): filtros por rango de fechas y por producto. Tabla con fecha/hora, producto, cajero, cantidad, precio unitario y total. |
| 4.9 | Verificar RN-01: intentar vender más unidades de las disponibles → debe retornar 409 con el stock actual. |
| 4.10 | Verificar RN-08: cambiar el precio de un producto → ver que las ventas anteriores conservan el precio original en el historial. |
| 4.11 | Integrar `DailySummary` en el dashboard con datos reales. |

---

### Fase 5 — Administración de Usuarios y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 5.1 | API Routes con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`. |
| 5.2 | El POST genera contraseña temporal con `crypto.randomBytes`, `must_change_password=true`, retorna en claro una sola vez con modal de advertencia. |
| 5.3 | En el login: si `must_change_password=true`, redirigir a `/profile` para cambio obligatorio. |
| 5.4 | Crear `app/admin/users/page.tsx`: tabla con nombre, email, rol, estado, último acceso. Acciones: activar/suspender. El admin no puede suspenderse a sí mismo. |
| 5.5 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. |
| 5.6 | Auditoría de empty states: inventario vacío, historial del día sin ventas, búsqueda sin resultados. |
| 5.7 | Manejo de errores global: 401 (sesión expirada), 403 (sin permisos), 409 (stock insuficiente — toast con el stock disponible, no un error genérico), 409 (nombre duplicado en producto), 500. |
| 5.8 | Verificar que todos los precios se muestran en formato COP: `$XX.XXX` o `$X.XXX.XXX` sin decimales para COP entero. |
| 5.9 | Verificar la vista del cajero: que no puede acceder a `/admin/*`, `/inventory/new`, `/inventory/[id]/edit` ni al historial completo de ventas. |
| 5.10 | Verificar el flujo de venta en celular (375px): buscador de producto → seleccionar → ingresar cantidad → confirmar. Botones de al menos 44px de alto. |
| 5.11 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 5.12 | Deploy en Vercel con todas las variables de entorno. |
| 5.13 | Probar en producción con ambos roles: admin hace bootstrap → agrega producto → cajero hace login → registra venta → admin ve historial y auditoría. |

---

## 19. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. dataService.getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active y password con bcrypt.compare()
4. Si must_change_password: flag en JWT → redirect /profile
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. dataService.recordAudit({ action: 'login', ... })
7. Retornar SafeUser
```

### Protección de endpoints

```typescript
// Ambos roles pueden:
//   GET /api/products, /api/sales, /api/dashboard
//   POST /api/sales

// Solo admin puede:
//   POST /api/products
//   PATCH /api/products/[id] (precio, stock)
//   DELETE /api/products/[id] (soft delete)
//   GET /api/sales/history (historial completo)
//   GET/POST/PUT /api/users
//   GET /api/audit
```

### Integridad de `registerSale`

La verificación de stock y el descuento ocurren en el servidor en secuencia. El cliente nunca puede:
- Enviar un precio distinto al del producto (el servidor lee el precio de la DB).
- Modificar el stock directamente.
- Omitir la verificación de disponibilidad.

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | Los usuarios los crea el admin. |
| RS-02 | Una moneda | Solo pesos colombianos (COP). Sin multimoneda. |
| RS-03 | Sin descuentos | No hay sistema de descuentos ni precios especiales por cantidad. |
| RS-04 | Sin clientes | Las ventas no se asocian a clientes — son ventas anónimas del mostrador. |
| RS-05 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |
| RS-06 | Auditoría no editable | Append-only en Blob. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Inventario** | Conjunto de productos registrados en el sistema con su stock actual. |
| **Stock** | Cantidad disponible de un producto en el inventario. |
| **Venta** | Registro de la salida de uno o más productos con descuento automático del stock. |
| **Snapshot de precio** | El precio unitario se copia al momento de la venta. Si el precio cambia después, las ventas anteriores no se alteran. |
| **Stock bajo** | Producto con menos de 5 unidades disponibles. Genera alerta visual. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **Modo seed** | Estado antes del bootstrap. Solo permite login admin. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Yarith Jiménez | Doc: 1082926628
> Curso: Lógica y Programación — SIST0200
