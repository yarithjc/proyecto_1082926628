import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, signSession } from '@/lib/auth';
import { getUserByEmail, touchLastLogin } from '@/lib/dataService';
import { recordAudit } from '@/lib/audit';
import { loginSchema } from '@/lib/schemas';
import { publicHandler, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const POST = publicHandler(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Credenciales inválidas' }, 400);
  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user || !user.is_active) {
    return json({ error: 'Credenciales inválidas' }, 401);
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return json({ error: 'Credenciales inválidas' }, 401);

  const token = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.must_change_password,
  });

  await touchLastLogin(user.id);
  await recordAudit({
    user_id: user.id === 'seed-admin' ? null : user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'login',
    entity: 'user',
    entity_id: user.id,
    summary: `Login de ${user.email}`,
  });

  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.must_change_password,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
});
