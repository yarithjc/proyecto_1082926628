import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './types';

const COOKIE_NAME = 'stockcontrol_session';

function getSecret(): Uint8Array {
  const raw =
    process.env.JWT_SECRET ||
    process.env.SUPABASE_STOCKCONTROL_SUPABASE_JWT_SECRET;
  if (!raw) throw new Error('JWT_SECRET no configurado');
  return new TextEncoder().encode(raw);
}

export const SESSION_COOKIE = COOKIE_NAME;

export async function signSession(payload: SessionPayload, ttlSeconds = 60 * 60 * 24): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      (payload.role === 'admin' || payload.role === 'cajero')
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        mustChangePassword: payload.mustChangePassword === true,
      };
    }
    return null;
  } catch {
    return null;
  }
}
