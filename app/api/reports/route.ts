import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/services/auth.service';
import { listReports } from '@/services/reports.service';
import { handleRouteError } from '@/lib/api-helpers';
import { paginationSchema } from '@/validations/common.schema';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(req);
    const sp = req.nextUrl.searchParams;
    const parsed = paginationSchema.safeParse({ page: sp.get('page'), limit: sp.get('limit'), sort: sp.get('sort') });
    if (!parsed.success) return NextResponse.json({ data:null, error: parsed.error.errors[0]?.message }, { status:400 });
    const result = await listReports(user.id, parsed.data.page, parsed.data.limit, parsed.data.sort);
    return NextResponse.json(result, { status: 200 });
  } catch (error) { return handleRouteError(error, 'GET /api/reports'); }
}
