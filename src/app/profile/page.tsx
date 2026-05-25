import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>;
}) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  const user = await getUserById(session.userId);
  if (!user) redirect('/login');
  const { force } = await searchParams;
  return (
    <ProfileClient
      user={{ email: user.email, name: user.name, role: user.role }}
      forced={force === '1' || user.must_change_password}
    />
  );
}
