import { diagnose } from '@/lib/dataService';
import { getMigrationStatus } from '@/lib/pgMigrate';
import { withRole, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async () => {
  const [d, migrations] = await Promise.all([diagnose(), getMigrationStatus().catch(() => [])]);
  return json({ ...d, migrations });
});
