# 🔗 GUÍA: Conectar a Supabase - Pasos Completados

## ✅ Paso 1: Variables de Entorno
**COMPLETADO** ✓ Archivo `.env.local` creado con:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

## 📝 Paso 2: Crear Tablas en Supabase (IMPORTANTE)

Debes ejecutar las **3 migraciones SQL** en Supabase:

### En Supabase Console:
1. Ve a **SQL Editor** en tu proyecto
2. Copia y ejecuta cada SQL de abajo en orden

---

### Migración 1: Crear tabla `users`

```sql
-- 0001_init_users.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'profesor' CHECK (role IN ('profesor', 'coordinador', 'admin')),
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- RLS: Los usuarios solo ven sus propios datos (excepto admin)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR (SELECT role FROM users WHERE id = auth.uid()::text) = 'admin');

CREATE POLICY "Admin can read all users" ON users
  FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()::text) = 'admin');
```

---

### Migración 2: Crear tabla `blocks` y `rooms`

```sql
-- 0002_init_spaces.sql
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  building TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_code ON blocks(code);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT,
  capacity INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(block_id, code)
);

CREATE INDEX IF NOT EXISTS idx_rooms_block_id ON rooms(block_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);

CREATE TABLE IF NOT EXISTS slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  order_index INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_is_active ON slots(is_active);
```

---

### Migración 3: Crear tabla `reservations`

```sql
-- 0003_init_reservations.sql
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  group_name TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  status TEXT DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ÍNDICE ÚNICO PARCIAL: Previene race condition (RN-03)
-- Solo una reserva confirmada por room/slot/date
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_unique_confirmed
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada';

-- Otros índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_reservations_professor_id ON reservations(professor_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Trigger: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();
```

---

## 🎯 Paso 3: Ejecutar SQL en Supabase

1. **Abre tu proyecto en [supabase.com](https://supabase.com)**
2. **SQL Editor** → **New Query**
3. Copia y ejecuta **CADA MIGRACIÓN** en orden:
   - Primero: `0001_init_users.sql`
   - Luego: `0002_init_spaces.sql`
   - Por último: `0003_init_reservations.sql`

---

## ✅ Paso 4: Verificar Conexión

Desde tu terminal (con Node.js instalado):

```bash
cd c:\Users\juanj\Documents\proyecto_1044218091
npm install
npm run dev
```

Debería ver:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

**Si ves esto → ¡CONEXIÓN EXITOSA!** ✨

---

## 🔐 Paso 5: Configurar JWT_SECRET

En `.env.local`, cambia `JWT_SECRET` por algo seguro:

```
JWT_SECRET=tu-secreto-muy-largo-y-aleatorio-minimo-32-caracteres
```

Genera uno aleatorio:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Resumen de Datos Guardados

**Archivo: `.env.local`** (PRIVADO - No compartir)
```
NEXT_PUBLIC_SUPABASE_URL=https://wtxdzsfgiudecqudjcox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=cambiar-esto
```

---

## 🆘 Si Algo Falla

**Error: "Cannot read property 'from' of undefined"**
→ Las tablas no existen. Ejecuta las 3 migraciones SQL

**Error: "Invalid API Key"**
→ Verifica que copiaste bien la anon key

**Error: "JWT invalid"**
→ El JWT_SECRET debe coincidir en todos lados

**Error: "node_modules not found"**
→ Primero instala: `npm install`

---

**¿Necesitas ayuda con algo específico?** 👇
