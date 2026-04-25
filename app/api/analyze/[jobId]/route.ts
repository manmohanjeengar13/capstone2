import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/services/auth.service';
import { getJobProgress } from '@/services/analyze.service';
import { ok, handleRouteError } from '@/lib/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<NextResponse> {
  try {
    const user = await requireAuth(req);
    const { jobId } = await params;
    const progress = await getJobProgress(jobId, user.id);
    return ok(progress);
  } catch (error) {
    return handleRouteError(error, 'GET /api/analyze/[jobId]');
  }
}