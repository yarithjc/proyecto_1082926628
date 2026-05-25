import { withRole, json } from '@/lib/withAuth';
import { readAuditMonth } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async (req) => {
  const url = new URL(req.url);
  const yyyymm =
    url.searchParams.get('month') ??
    new Date().toISOString().slice(0, 7).replace('-', '');
  const entries = await readAuditMonth(yyyymm);
  return json({ entries, month: yyyymm });
});
