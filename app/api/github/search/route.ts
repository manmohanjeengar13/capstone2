import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth, getDecryptedGithubToken } from '@/services/auth.service';
import { searchUserRepos } from '@/services/github.service';
import { ok, handleRouteError } from '@/lib/api-helpers';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(req);
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (!q || q.length < 2) return ok([]);
    const token = getDecryptedGithubToken(user) ?? undefined;
    return ok(await searchUserRepos(q, user.githubLogin ?? '', token));
  } catch (error) { return handleRouteError(error, 'GET /api/github/search'); }
}
