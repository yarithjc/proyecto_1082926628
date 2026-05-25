import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from './auth';
import type { Role, SessionPayload } from './types';
import { AppError } from './types';

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export type Handler = (req: NextRequest, ctx: { session: SessionPayload }) => Promise<Response> | Response;

function json(body: unknown, status = 200): Response {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function withAuth(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      const store = await cookies();
      const token = store.get(SESSION_COOKIE)?.value;
      if (!token) return json({ error: 'No autenticado' }, 401);
      const session = await verifySession(token);
      if (!session) return json({ error: 'Sesión inválida' }, 401);
      const res = await handler(req, { session });
      res.headers.set('Cache-Control', NO_STORE['Cache-Control']);
      return res;
    } catch (err) {
      if (err instanceof AppError) {
        return json({ error: err.message, details: err.details }, err.status);
      }
      console.error('[withAuth] error', err);
      return json({ error: 'Error interno' }, 500);
    }
  };
}

export function withRole(roles: Role[], handler: Handler) {
  return withAuth(async (req, ctx) => {
    if (!roles.includes(ctx.session.role)) {
      return json({ error: 'Sin permisos' }, 403);
    }
    return handler(req, ctx);
  });
}

export function publicHandler(
  handler: (req: NextRequest) => Promise<Response> | Response
) {
  return async (req: NextRequest) => {
    try {
      const res = await handler(req);
      res.headers.set('Cache-Control', NO_STORE['Cache-Control']);
      return res;
    } catch (err) {
      if (err instanceof AppError) {
        return json({ error: err.message, details: err.details }, err.status);
      }
      console.error('[publicHandler] error', err);
      return json({ error: 'Error interno' }, 500);
    }
  };
}

export { json };
