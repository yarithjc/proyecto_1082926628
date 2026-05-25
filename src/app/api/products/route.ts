import { withAuth, withRole, json } from '@/lib/withAuth';
import { createProduct, getProducts } from '@/lib/dataService';
import { createProductSchema } from '@/lib/schemas';
import { BadRequestError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const search = url.searchParams.get('q') ?? undefined;
  const includeInactive = url.searchParams.get('all') === '1';
  const products = await getProducts({
    search,
    onlyActive: !includeInactive,
  });
  return json({ products });
});

export const POST = withRole(['admin'], async (req, { session }) => {
  const body = await req.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
  const product = await createProduct(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data
  );
  return json({ product }, 201);
});
