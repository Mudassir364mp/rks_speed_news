import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback_secret_change_me_in_production'
);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

export async function decrypt(input) {
  const { payload } = await jwtVerify(input, secret, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession() {
  const session = (await cookies()).get('rks_admin_token')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (err) {
    return null;
  }
}

export async function updateSession(request) {
  const session = request.cookies.get('rks_admin_token')?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'rks_admin_token',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

