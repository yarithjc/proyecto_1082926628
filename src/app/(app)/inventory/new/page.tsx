import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { ProductForm } from '@/components/inventory/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/inventory');
  return <ProductForm />;
}
