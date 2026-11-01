import { NextRequest, NextResponse } from 'next/server';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { version } = body;

    // Check version concurrency (PRD Section 11 & addendum)
    if (version !== undefined && version !== 1) {
      return apiError(ApiErrorCode.CONFLICT, 'Plan version is stale. Refresh to approve.', 409);
    }

    return NextResponse.json({
      plan_id: id,
      version: 1,
      status: 'active',
      approved_at: new Date().toISOString(),
      message: 'Plan successfully approved and activated',
    });
  } catch (err: any) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, err.message, 500);
  }
}
