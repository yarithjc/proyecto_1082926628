import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const session = await verifySession(token);
    if (session) {
      await recordAudit({
        user_id: session.userId === 'seed-admin' ? null : session.userId,
        user_email: session.email,
        user_role: session.role,
        action: 'logout',
        entity: 'user',
        entity_id: session.userId,
        summary: `Logout de ${session.email}`,
      });
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0, httpOnly: true });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
}
