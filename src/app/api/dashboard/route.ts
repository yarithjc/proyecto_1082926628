import { getDashboardData } from '@/lib/dataService';
import { withAuth, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async () => {
  const data = await getDashboardData();
  return json(data);
});
