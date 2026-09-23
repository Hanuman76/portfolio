import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Default admin password is 'admin1947'
    if (password === 'admin1947') {
      const response = NextResponse.json({ success: true, message: 'Authentication successful' });
      // Set simple auth cookie
      response.cookies.set('admin_auth', 'authenticated', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid admin passcode' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
