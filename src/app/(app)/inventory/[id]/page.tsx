import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getProductById, getSales } from '@/lib/dataService';
import { ProductDetail } from '@/components/inventory/ProductDetail';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');

  const product = await getProductById(id);
  if (!product) notFound();

  const sales = await getSales({ productId: id });

  return <ProductDetail product={product} role={session.role} sales={sales.slice(0, 50)} />;
}
