import { changePassword } from '@/lib/dataService';
import { changePasswordSchema } from '@/lib/schemas';
import { withAuth, json } from '@/lib/withAuth';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  await changePassword(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data.currentPassword,
    parsed.data.newPassword
  );
  return json({ ok: true });
});
