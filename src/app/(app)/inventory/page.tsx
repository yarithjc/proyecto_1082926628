import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { InventoryClient } from '@/components/inventory/InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  return <InventoryClient role={session.role} />;
}
