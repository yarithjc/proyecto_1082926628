import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (session) redirect('/dashboard');
  redirect('/login');
}
