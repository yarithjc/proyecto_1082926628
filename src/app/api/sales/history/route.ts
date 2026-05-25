import { withRole, json } from '@/lib/withAuth';
import { getSales } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async (req) => {
  const url = new URL(req.url);
  const sales = await getSales({
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    productId: url.searchParams.get('productId') ?? undefined,
  });
  return json({ sales });
});
