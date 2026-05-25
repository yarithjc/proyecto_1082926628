import { withAuth, withRole, json } from '@/lib/withAuth';
import {
  deactivateProduct,
  getProductById,
  updateProductPrice,
  updateProductStock,
} from '@/lib/dataService';
import {
  updateProductPriceSchema,
  updateProductStockSchema,
} from '@/lib/schemas';
import { BadRequestError, NotFoundError } from '@/lib/types';

export const dynamic = 'force-dynamic';

function getId(req: Request): string {
  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

export const GET = withAuth(async (req) => {
  const product = await getProductById(getId(req));
  if (!product) throw new NotFoundError('Producto no encontrado');
  return json({ product });
});

export const PATCH = withRole(['admin'], async (req, { session }) => {
  const id = getId(req);
  const body = await req.json().catch(() => null);
  const actor = { id: session.userId, email: session.email, role: session.role };
  if (body?.kind === 'price') {
    const parsed = updateProductPriceSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
    const product = await updateProductPrice(actor, id, parsed.data.price);
    return json({ product });
  }
  if (body?.kind === 'stock') {
    const parsed = updateProductStockSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestError('Datos inválidos', parsed.error.flatten());
    const product = await updateProductStock(actor, id, parsed.data.quantity);
    return json({ product });
  }
  throw new BadRequestError('Falta `kind` ("price" | "stock")');
});

export const DELETE = withRole(['admin'], async (req, { session }) => {
  const id = getId(req);
  const product = await deactivateProduct(
    { id: session.userId, email: session.email, role: session.role },
    id
  );
  return json({ product });
});
