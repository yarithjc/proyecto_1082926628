import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getProductById } from '@/lib/dataService';
import { EditProductForm } from '@/components/inventory/EditProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect(`/inventory/${id}`);
  const product = await getProductById(id);
  if (!product) notFound();
  return <EditProductForm product={product} />;
}
