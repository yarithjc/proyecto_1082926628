import { getSystemMode } from '@/lib/dataService';
import { publicHandler, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const GET = publicHandler(async () => {
  const mode = await getSystemMode();
  return json({ mode });
});
