import { NextRequest, NextResponse } from 'next/server';
import { getCuratedRole } from '@/src/lib/career/role-service';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';

export async function GET(req: NextRequest) {
  const role = getCuratedRole();
  return NextResponse.json({
    roles: [role],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, region, level, jd_text } = body;

    if (!title) {
      return apiError(ApiErrorCode.UNPROCESSABLE_ENTITY, 'Role title is required', 422);
    }

    const createdRole = {
      id: `role_${Date.now()}`,
      title,
      region: region || 'US',
      level: level || 'mid',
      description: jd_text || 'User defined target role',
      required_skills: [
        { skill_id: 'sql', canonical_name: 'SQL (Structured Query Language)', importance: 1.0 },
        { skill_id: 'python', canonical_name: 'Python Programming', importance: 0.9 },
        { skill_id: 'data-visualization', canonical_name: 'Data Visualization', importance: 0.8 },
      ],
    };

    return NextResponse.json({ role: createdRole });
  } catch (err: any) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, err.message, 500);
  }
}
