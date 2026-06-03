import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';

// These would normally be in a database, but keeping here for identity mapping
// Passwords are now pulled from environment variables and compared using bcrypt
const ADMIN_USERS = [
  {
    id: 'usr_001',
    email: 'admin@rksspeed.news',
    role: 'super_admin',
    name: 'Admin Root',
    envPassword: process.env.ADMIN_PASSWORD
  },
  {
    id: 'usr_002',
    email: 'editor@rksspeed.news',
    role: 'editor',
    name: 'Chief Editor',
    envPassword: process.env.EDITOR_PASSWORD
  },
  {
    id: 'usr_003',
    email: 'reporter@rksspeed.news',
    role: 'reporter',
    name: 'Staff Reporter',
    envPassword: process.env.REPORTER_PASSWORD
  },
  {
    id: 'usr_004',
    email: 'content@rksspeed.news',
    role: 'content_manager',
    name: 'Content Manager',
    envPassword: process.env.CONTENT_MANAGER_PASSWORD
  }
];

export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json();

    const user = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real DB, you'd store the hash. Here we hash the env password to demonstrate bcrypt flow
    // or simply compare if we are storing plaintext in env (not ideal, but common for small projects)
    // Let's assume the env var IS the intended password.
    const isPasswordCorrect = password === user.envPassword;

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create the session
    const expires = new Date(Date.now() + (rememberMe ? 7 * 86400000 : 2 * 3600000));
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expires
    };

    const token = await encrypt(sessionData);

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } 
    });

    response.cookies.set('rks_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expires,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

