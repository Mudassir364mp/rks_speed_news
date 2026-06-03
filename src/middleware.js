import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback_secret_change_me_in_production'
);

// Public GET routes Ã¢â‚¬â€ koi bhi read kar sakta hai
const PUBLIC_GET_ROUTES = [
  '/api/articles',
  '/api/upload',
  '/api/breaking',
  '/api/categories',
  '/api/ads',
];

export async function middleware(request) {
  const { pathname, method } = request.nextUrl;
  const reqMethod = request.method;

  // 1. Login/Logout hamesha public
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  // 2. Public GET routes Ã¢â‚¬â€ token ki zaroorat nahi
  const isPublicGet = PUBLIC_GET_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicGet && reqMethod === 'GET') {
    return NextResponse.next();
  }

  // 3. Baaki sab (POST, PUT, DELETE aur /api/admin/*) Ã¢â‚¬â€ token chahiye
  if (pathname.startsWith('/api')) {
    const token = request.cookies.get('rks_admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
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



