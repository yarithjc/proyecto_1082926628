import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/lib/supabase';

const FALLBACK_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stockcontrol.com';
const FALLBACK_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim().toLowerCase() ?? '';
  const password = body?.password?.toString() ?? '';

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email y contraseña son obligatorios' },
      { status: 400 }
    );
  }

  const sb = getSupabaseClient();
  let role: string | null = null;

  if (sb) {
    const { data } = await sb
      .from('users')
      .select('email, role, password_hash')
      .ilike('email', email)
      .maybeSingle();

    if (data?.password_hash && (await bcrypt.compare(password, data.password_hash))) {
      role = data.role || 'user';
    }
  }

  if (
    !role &&
    email === FALLBACK_ADMIN_EMAIL.toLowerCase() &&
    password === FALLBACK_ADMIN_PASSWORD
  ) {
    role = 'admin';
  }

  if (!role) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const response = NextResponse.json({ message: 'Autenticado', role });
  response.cookies.set('stockcontrol_session', role, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
