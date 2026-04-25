import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

type UserRecord = { id: string; email: string; name: string | null; avatarUrl: string | null; githubToken: string | null; githubLogin: string | null; createdAt: Date; updatedAt: Date; };

function extractToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('better-auth.session-token')?.value ?? req.cookies.get('__session')?.value ?? req.cookies.get('session')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserRecord | null> {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id:true, email:true, name:true, avatarUrl:true, githubToken:true, githubLogin:true, createdAt:true, updatedAt:true } } },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) { await prisma.session.delete({ where: { id: session.id } }).catch(() => {}); return null; }
    return session.user;
  } catch (error) {
    logger.error('Session lookup failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
}

export function getDecryptedGithubToken(user: UserRecord): string | null {
  if (!user.githubToken) return null;
  try { return decrypt(user.githubToken, ENCRYPTION_KEY); } catch { return null; }
}

export async function requireAuth(req: NextRequest): Promise<UserRecord> {
  const user = await getSessionFromRequest(req);
  if (!user) throw new AppError('Authentication required. Please sign in.', 401, 'ERR_UNAUTHORIZED');
  return user;
}
