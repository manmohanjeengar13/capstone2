import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/services/auth.service';
import { getDashboardStats } from '@/services/reports.service';
import { ok, handleRouteError } from '@/lib/api-helpers';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try { const user = await requireAuth(req); return ok(await getDashboardStats(user.id)); }
  catch (error) { return handleRouteError(error, 'GET /api/dashboard'); }
}
