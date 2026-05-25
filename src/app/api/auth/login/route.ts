import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stockcontrol.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim() ?? '';
  const password = body?.password?.toString() ?? '';

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email y contraseña son obligatorios' },
      { status: 400 }
    );
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ message: 'Autenticado' });
  response.cookies.set('stockcontrol_session', 'admin', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
