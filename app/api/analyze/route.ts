import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth, getDecryptedGithubToken } from '@/services/auth.service';
import { createAndEnqueueJob } from '@/services/analyze.service';
import { checkRateLimit } from '@/lib/rateLimit';
import { ok, err, handleRouteError } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';
import { repoUrlSchema } from '@/validations/analyze.schema';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(req);
    const rl = await checkRateLimit(`ratelimit:analyze:${user.id}`, 5, 3600);
    if (!rl.allowed) return NextResponse.json({ data:null, error:`Rate limit exceeded. Wait ${rl.retryAfter}s.` }, { status:429, headers:{'Retry-After':String(rl.retryAfter),'X-RateLimit-Limit':'5','X-RateLimit-Remaining':'0'} });
    let body: unknown;
    try { body = await req.json(); } catch { return err('Invalid JSON body', 400); }
    const parsed = repoUrlSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.errors[0]?.message ?? 'Validation error', 400);
    const token = getDecryptedGithubToken(user);
    if (!token) return err('No GitHub token found. Sign in with GitHub to analyze repos.', 400);
    const jobId = await createAndEnqueueJob(parsed.data.repoUrl, user, token);
    logger.info('Analysis submitted', { jobId, userId: user.id });
    return ok({ jobId, status: 'PENDING' }, 202);
  } catch (error) { return handleRouteError(error, 'POST /api/analyze'); }
}
