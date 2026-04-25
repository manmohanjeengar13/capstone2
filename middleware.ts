import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const PROTECTED = ['/dashboard', '/analyze', '/reports'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
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