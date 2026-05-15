import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseClient, executeSql } from '@/lib/supabase';

/**
 * GET /api/setup-database
 * Prueba la conexión a Supabase y lista las tablas existentes
 */
export async function GET() {
  try {
    const client = requireSupabaseClient();

    // Listar todas las tablas en el schema public
    const { data: tables, error } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: `Error al listar tablas: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Contar filas en cada tabla
    const tableData: Record<string, number> = {};

    for (const table of tables || []) {
      const tableName = table.table_name;
      const { count } = await client
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      tableData[tableName] = count || 0;
    }

    return NextResponse.json({
      connected: true,
      tables: tableData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/setup-database
 * Crea todas las tablas con RLS y policies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'create-all') {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      );
    }

    const results: Array<{
      status: 'success' | 'error';
      message: string;
      table?: string;
      details?: string;
    }> = [];

    // Array de tablas a crear
    const tables = ['pages', 'products', 'users'];

    // === Tabla: pages ===
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          subtitle TEXT,
          description TEXT,
          effect TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

        DO \$\$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'pages' AND policyname = 'service_role_all'
          ) THEN
            CREATE POLICY service_role_all ON public.pages
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END \$\$;

        CREATE INDEX IF NOT EXISTS pages_name_idx ON public.pages(name);
        
        NOTIFY pgrst, 'reload schema';
      `);

      results.push({
        status: 'success',
        message: 'Tabla creada correctamente',
        table: 'pages',
      });
    } catch (err) {
      results.push({
        status: 'error',
        message: 'Error al crear tabla pages',
        table: 'pages',
        details: err instanceof Error ? err.message : 'Error desconocido',
      });
    }

    // === Tabla: products ===
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          sku TEXT NOT NULL UNIQUE,
          quantity INTEGER NOT NULL DEFAULT 0,
          price DECIMAL(10, 2) NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

        DO \$\$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'products' AND policyname = 'service_role_all'
          ) THEN
            CREATE POLICY service_role_all ON public.products
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END \$\$;

        CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products(sku);
        CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);
        
        NOTIFY pgrst, 'reload schema';
      `);

      results.push({
        status: 'success',
        message: 'Tabla creada correctamente',
        table: 'products',
      });
    } catch (err) {
      results.push({
        status: 'error',
        message: 'Error al crear tabla products',
        table: 'products',
        details: err instanceof Error ? err.message : 'Error desconocido',
      });
    }

    // === Tabla: users ===
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        DO \$\$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'users' AND policyname = 'service_role_all'
          ) THEN
            CREATE POLICY service_role_all ON public.users
              FOR ALL TO service_role USING (true) WITH CHECK (true);
          END IF;
        END \$\$;

        CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
        CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
        
        NOTIFY pgrst, 'reload schema';
      `);

      results.push({
        status: 'success',
        message: 'Tabla creada correctamente',
        table: 'users',
      });
    } catch (err) {
      results.push({
        status: 'error',
        message: 'Error al crear tabla users',
        table: 'users',
        details: err instanceof Error ? err.message : 'Error desconocido',
      });
    }

    // Final notification
    try {
      await executeSql(`NOTIFY pgrst, 'reload schema';`);
    } catch {
      // Ignorar error en notificación final
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
