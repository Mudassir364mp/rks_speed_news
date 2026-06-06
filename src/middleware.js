import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback_secret_change_me_in_production'
);

const PUBLIC_GET_ROUTES = [
  '/api/articles',
  '/api/upload',
  '/api/articles/id',
  '/api/breaking',
  '/api/categories',
  '/api/ads',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const reqMethod = request.method;

  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  const isPublicGet = PUBLIC_GET_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicGet && reqMethod === 'GET') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    const token = request.cookies.get('rks_admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const response = NextResponse.next();

      // Auto-refresh — agar 30 min se kam bacha hai toh renew karo
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      if (exp && exp - now < 30 * 60) {
        const newToken = await new SignJWT({ ...payload })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('2h')
          .sign(secret);

        response.cookies.set('rks_admin_token', newToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }

      return response;
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};