# Setup Supabase - Completado ✅

## Resumen de lo que se implementó

Se ha configurado la integración de **Supabase (PostgreSQL)** en tu proyecto Next.js siguiendo el prompt `PROMPT_0_SUPABASE.md`.

### Archivos Creados

```
src/lib/
  ├── supabase.ts              ← Cliente build-safe (getSupabaseClient, requireSupabaseClient, executeSql)
  └── types.ts                 ← Tipos TypeScript (Page, Product, User)

src/app/
  ├── setup-database/
  │   └── page.tsx             ← UI para probar conexión y crear tablas
  └── api/
      └── setup-database/
          └── route.ts         ← API endpoints (GET para probar, POST para crear)
```

### Dependencias Instaladas

```bash
✓ @supabase/supabase-js       # Cliente JS de Supabase
✓ postgres                     # Conexión directa a PostgreSQL (para DDL)
```

### Tablas SQL Definidas

1. **pages** - Contenido de páginas (hero, secciones, etc.)
   - `id` (UUID, PK)
   - `name` (unique)
   - `title`, `subtitle`, `description`, `effect`
   - Índice en `name`

2. **products** - Inventario/stock
   - `id` (UUID, PK)
   - `name`, `description`, `sku` (unique)
   - `quantity`, `price`
   - Índices en `sku` y `created_at`

3. **users** - Usuarios del sistema
   - `id` (UUID, PK)
   - `email` (unique), `name`, `role` (admin/user)
   - Índices en `email` y `role`

**Todas las tablas:**
- Tienen `created_at` y `updated_at`
- Tienen RLS (Row Level Security) habilitado
- Tienen policy para `service_role` (acceso total desde backend)

### Build Status

✅ **Build exitoso** - `npm run build` compiló sin errores

```
Route (app)
├ ○ /                     ← Static
├ ○ /_not-found           ← Static
├ ƒ /api/home             ← Dynamic
├ ƒ /api/setup-database   ← Dynamic
└ ○ /setup-database       ← Static
```

---

## Cómo Usar

### Paso 1: Obtener Credenciales de Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto
2. Ir a **Project Settings → API**
3. Copiar:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service Role Secret)
4. Ir a **Project Settings → Database → Connection Pooling** y copiar:
   - `POSTGRES_URL` (conexión directa)

### Paso 2: Crear .env.local

```bash
cp .env.example .env.local
```

Luego editar `.env.local` y rellenar:

```env
SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
POSTGRES_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres
```

### Paso 3: Probar en Local

```bash
npm run dev
```

1. Abrir http://localhost:3000/setup-database
2. Click **"Probar Conexión"** → debe mostrar "✅ Conectado"
3. Click **"Crear Todas las Tablas"** → debe crear las 3 tablas (✅ para cada una)
4. Volver a click "Probar Conexión" → debe listar las 3 tablas con 0 filas

### Paso 4: Deploy en Vercel (Opcional)

1. **Opción A: Integración automática (recomendado)**
   - En Vercel dashboard → **Integrations → Supabase**
   - Conectar tu proyecto Supabase
   - Las variables se rellenan automáticamente

2. **Opción B: Manual**
   - En Vercel → **Project Settings → Environment Variables**
   - Agregar:
     ```
     SUPABASE_URL = ...
     SUPABASE_SERVICE_ROLE_KEY = ...
     POSTGRES_URL = ...
     NEXT_PUBLIC_SUPABASE_ANON_KEY = ...
     ```
   - Push a GitHub → Vercel auto-deploya
   - Abrir `https://tu-url.vercel.app/setup-database`
   - Probar conexión y crear tablas

### Paso 5: Eliminar Page de Setup

Después que confirmes que todo funciona:

1. Eliminar carpeta `src/app/setup-database/`
2. Eliminar carpeta `src/app/api/setup-database/`
3. `npm run build` para verificar
4. Push a GitHub

---

## Arquitectura

```
Tu Proyecto Next.js
├── lib/supabase.ts
│   ├── getSupabaseClient() → SupabaseClient | null (build-safe)
│   ├── requireSupabaseClient() → SupabaseClient (lanza si no hay config)
│   └── executeSql() → Ejecuta DDL contra PostgreSQL
│
├── Componentes/Pages
│   └── Usan fetch('/api/...') para acceder a datos
│
└── Route Handlers (/api/...)
    └── Usan client.from('tabla').select() para CRUD
```

**Flujo:** Browser → `fetch('/api/...')` → Route Handler → `getSupabaseClient()` → Supabase (PostgREST o PostgreSQL)

---

## Reglas Importantes

| ✅ Correcto | ❌ Incorrecto |
|---|---|
| `getSupabaseClient()` retorna `null` si no hay env vars | Lanzar error si faltan variables |
| Importar Supabase en Route Handlers o Server Components | Importar en Client Components |
| Usar `fetch('/api/...')` desde el navegador | Conectar directamente a Supabase desde el cliente |
| `executeSql()` para CREATE TABLE/ALTER | Usar JS client para DDL |
| RLS + policies en todas las tablas | Tablas sin RLS |

---

## Solución de Problemas

| Síntoma | Causa | Solución |
|---|---|---|
| Build falla con "Supabase not configured" | `getSupabaseClient()` lanza error | Ya está arreglado en lib/supabase.ts (retorna null) |
| "Could not find table in schema cache" | PostgREST no recargó | Ya incluido: `NOTIFY pgrst, 'reload schema'` |
| "/setup-database" no existe | Carpeta no creada | Verificar que existe src/app/setup-database/page.tsx |
| Error al conectar | Credenciales inválidas | Verificar .env.local y que el proyecto existe en Supabase |
| "RLS Disabled" | Falta `ALTER TABLE ... ENABLE RLS` | Ya incluido en SQL de creación |

---

## Próximos Pasos Opcionales

1. **Agregar Service Actions** para operaciones CRUD
2. **Crear componentes** que usen `getSupabaseClient()`
3. **Implementar autenticación** con Supabase Auth
4. **Agregar más tablas** siguiendo el patrón de SQL en route.ts

Para más info, revisa [Doc/GUIA_SUPABASE.md](../GUIA_SUPABASE.md)
