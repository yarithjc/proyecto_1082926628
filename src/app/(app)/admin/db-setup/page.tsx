import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { DbSetupClient } from './DbSetupClient';

export const dynamic = 'force-dynamic';

export default async function DbSetupPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== 'admin') redirect('/dashboard');
  return <DbSetupClient />;
}
