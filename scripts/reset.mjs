import postgres from "postgres";
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

const sql = postgres(connString, { ssl: "require", max: 1 });

try {
  console.log("[reset] Dropping tablas legacy...");
  await sql.unsafe(`
    DROP TABLE IF EXISTS public.sales CASCADE;
    DROP TABLE IF EXISTS public.products CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
    DROP TABLE IF EXISTS public.pages CASCADE;
    DROP TABLE IF EXISTS public._migrations CASCADE;
    DROP TABLE IF EXISTS public._audit CASCADE;
  `);
  console.log("[reset] OK");
} catch (e) {
  console.error("[reset] ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
