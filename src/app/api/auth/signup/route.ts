import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, signSession } from '@/lib/auth';
import { signupSchema } from '@/lib/schemas';
import { publicHandler, json } from '@/lib/withAuth';
import { getSupabaseClient } from '@/lib/supabase';
import { recordAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const POST = publicHandler(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos. Verifica nombre, email y contraseña.' }, 400);
  }

  const { name, email, password } = parsed.data;
  const sb = getSupabaseClient();
  if (!sb) {
    return json({ error: 'Servicio no disponible' }, 503);
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const { data: newUser, error: createError } = await sb
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: hash,
        role: 'cajero', // Rol por defecto para nuevos usuarios
        is_active: true,
        must_change_password: false,
      })
      .select('*')
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return json({ error: 'Este correo ya está registrado' }, 409);
      }
      throw createError;
    }

    // Registrar la auditoría
    await recordAudit({
      user_id: null,
      user_email: email,
      user_role: 'cajero',
      action: 'signup',
      entity: 'user',
      entity_id: newUser.id,
      summary: `Nuevo registro de usuario: ${email}`,
    });

    // Crear sesión
    const token = await signSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      mustChangePassword: false,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return res;
  } catch (error) {
    console.error('Signup error:', error);
    return json({ error: 'Error al crear la cuenta' }, 500);
  }
});
