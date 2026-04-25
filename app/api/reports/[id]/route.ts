import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/services/auth.service';
import { getReport, softDeleteReport } from '@/services/reports.service';
import { ok, handleRouteError } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try { const user = await requireAuth(req); return ok(await getReport(params.id, user.id)); }
  catch (error) { return handleRouteError(error, `GET /api/reports/${params.id}`); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try { const user = await requireAuth(req); await softDeleteReport(params.id, user.id); return ok({ deleted:true, id:params.id }); }
  catch (error) { return handleRouteError(error, `DELETE /api/reports/${params.id}`); }
}
