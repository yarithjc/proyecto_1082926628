import { withAuth, json } from '@/lib/withAuth';
import { getDailySummary } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async () => {
  const summary = await getDailySummary();
  return json(summary);
});
