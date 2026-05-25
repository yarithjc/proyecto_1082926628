import { withAuth, json } from '@/lib/withAuth';
import { getTodaySales, registerSale } from '@/lib/dataService';
import { registerSaleSchema } from '@/lib/schemas';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async () => {
  const sales = await getTodaySales();
  return json({ sales });
});

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json().catch(() => null);
  const parsed = registerSaleSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  const sale = await registerSale(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data
  );
  return json({ sale }, 201);
});
