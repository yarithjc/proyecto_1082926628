import postgres from "postgres";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const connString =
  process.env.SUPABASE_STOCKCONTROL_POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_STOCKCONTROL_POSTGRES_URL;

if (!connString) {
  console.error("[seed] No POSTGRES_URL en .env.local");
  process.exit(1);
}

const sql = postgres(connString, {
  ssl: "require",
  connect_timeout: 15,
  idle_timeout: 5,
  max: 1,
});

try {
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log("[seed] Tablas:", tables.map((t) => t.table_name).join(", "));

  // pages: home page
  const pages = await sql`
    INSERT INTO public.pages (name, title, subtitle, description, effect)
    VALUES ('home', 'Hola Mundo', 'TypeScript · Next.js · Vercel ✓',
            'Sistema fullstack funcionando correctamente.', 'glow-pulse')
    ON CONFLICT (name) DO UPDATE
      SET title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          description = EXCLUDED.description,
          effect = EXCLUDED.effect,
          updated_at = NOW()
    RETURNING name
  `;
  console.log("[seed] pages upsert:", pages.map((r) => r.name).join(", "));

  // users: admin (login inicial)
  await sql.unsafe(
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
  );
  const adminEmail = process.env.ADMIN_EMAIL || "admin@stockcontrol.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin1234!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const users = await sql`
    INSERT INTO public.users (email, name, role, password_hash)
    VALUES (${adminEmail}, 'Administrador', 'admin', ${passwordHash})
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
    RETURNING email
  `;
  console.log("[seed] users upsert:", users.map((r) => r.email).join(", "));

  // products: demo seed
  const products = await sql`
    INSERT INTO public.products (name, description, sku, quantity, price) VALUES
      ('Cuaderno Universitario', '100 hojas cuadriculadas', 'SKU-CUA-001', 50, 12500.00),
      ('Esfero Negro', 'Punta media 1.0mm', 'SKU-ESF-001', 200, 1800.00),
      ('Calculadora Científica', 'Modelo escolar', 'SKU-CAL-001', 15, 65000.00)
    ON CONFLICT (sku) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          quantity = EXCLUDED.quantity,
          price = EXCLUDED.price,
          updated_at = NOW()
    RETURNING sku
  `;
  console.log("[seed] products upsert:", products.map((r) => r.sku).join(", "));

  await sql.unsafe(`NOTIFY pgrst, 'reload schema'`);

  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM public.pages)::int    AS pages,
      (SELECT COUNT(*) FROM public.users)::int    AS users,
      (SELECT COUNT(*) FROM public.products)::int AS products
  `;
  console.log("[seed] counts:", counts[0]);
  console.log("[seed] OK");
} catch (err) {
  console.error("[seed] ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
