import { bootstrap } from '@/lib/dataService';
import { withRole, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const POST = withRole(['admin'], async (_req, { session }) => {
  const result = await bootstrap({ id: session.userId, email: session.email, role: session.role });
  return json({ ok: true, ...result });
});
