import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { UsersClient } from '@/components/admin/UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/dashboard');
  return <UsersClient currentUserId={session.userId} />;
}
