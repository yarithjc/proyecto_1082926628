import { withAuth, json } from '@/lib/withAuth';
import { getProducts } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  if (!q) return json({ products: [] });
  const products = await getProducts({ search: q, onlyActive: true });
  return json({ products: products.slice(0, 12) });
});
