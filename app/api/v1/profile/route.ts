import { NextRequest, NextResponse } from 'next/server';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';

export async function GET(req: NextRequest) {
  // Return current profile structure or demo profile
  return NextResponse.json({
    profile: {
      region: 'US',
      language: 'en',
      weekly_minutes: 240,
      summary: 'Data Analyst focusing on SQL, Python, and BI Dashboards',
      status: 'active',
      version: 1,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { version, fields } = body;

    if (version !== undefined && version < 1) {
      return apiError(ApiErrorCode.CONFLICT, 'Stale profile version', 409);
    }

    return NextResponse.json({
      success: true,
      updated_version: (version || 1) + 1,
      fields,
    });
  } catch (err: any) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, err.message, 500);
  }
}
