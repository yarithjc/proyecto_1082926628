import { withAuth, json } from '@/lib/withAuth';
import { deleteSale, updateSale } from '@/lib/dataService';
import { updateSaleSchema } from '@/lib/schemas';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const DELETE = withAuth(async (_req, { params, session }) => {
  const { id } = await params;
  await deleteSale(
    { id: session.userId, email: session.email, role: session.role },
    id
  );
  return json({ success: true });
});

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSaleSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  const sale = await updateSale(
    { id: session.userId, email: session.email, role: session.role },
    id,
    parsed.data
  );
  return json({ sale });
});
