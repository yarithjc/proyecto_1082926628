import { getUserById } from '@/lib/dataService';
import { withAuth, json } from '@/lib/withAuth';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req, { session }) => {
  const user = await getUserById(session.userId);
  if (!user) return json({ error: 'No encontrado' }, 404);
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.must_change_password,
    },
  });
});
