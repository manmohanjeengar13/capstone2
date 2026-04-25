// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/analyze', '/reports'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    // Check for Better Auth session cookie directly — no Node.js imports needed
    const sessionCookie = 
      req.cookies.get('better-auth.session_token') ?? 
      req.cookies.get('__Secure-better-auth.session_token');

    if (!sessionCookie?.value) {
      const url = new URL('/login', req.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  res.headers.set('X-Request-Id', crypto.randomUUID());
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/reports/:path*'],
};