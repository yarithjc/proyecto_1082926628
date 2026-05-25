import { withRole, json } from '@/lib/withAuth';
import { updateUser } from '@/lib/dataService';
import { updateUserSchema } from '@/lib/schemas';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

function getId(req: Request): string {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

export const PUT = withRole(['admin'], async (req, { session }) => {
  const id = getId(req);
  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  const user = await updateUser(
    { id: session.userId, email: session.email, role: session.role },
    id,
    parsed.data
  );
  return json({ user });
});
