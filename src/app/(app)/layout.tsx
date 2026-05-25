import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getUserById, getSystemMode } from '@/lib/dataService';
import { AppLayout } from '@/components/layout/AppLayout';
import { SeedModeBanner } from '@/components/layout/SeedModeBanner';

export const dynamic = 'force-dynamic';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');

  const user = await getUserById(session.userId);
  if (!user || !user.is_active) redirect('/login');
  if (user.must_change_password) redirect('/profile?force=1');

  const mode = await getSystemMode();

  return (
    <AppLayout user={{ id: user.id, email: user.email, name: user.name, role: user.role }}>
      {mode === 'seed' && <SeedModeBanner isAdmin={user.role === 'admin'} />}
      {children}
    </AppLayout>
  );
}
