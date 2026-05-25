import { withRole, json } from '@/lib/withAuth';
import { createUser, listUsers } from '@/lib/dataService';
import { createUserSchema } from '@/lib/schemas';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async () => {
  const users = await listUsers();
  return json({ users });
});

export const POST = withRole(['admin'], async (req, { session }) => {
  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  const { user, tempPassword } = await createUser(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data
  );
  return json({ user, tempPassword }, 201);
});
