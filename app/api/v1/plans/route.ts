import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyPlan } from '@/src/lib/career/plan-generator';
import { generateRoleSkillMap } from '@/src/lib/career/role-service';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';

export async function GET(req: NextRequest) {
  const roleId = 'role_jda_001';
  const gaps = generateRoleSkillMap(roleId);
  const plan = generateWeeklyPlan(roleId, gaps, 240, 4);

  return NextResponse.json({ plan });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role_id, weekly_minutes, horizon_weeks } = body;

    const roleId = role_id || 'role_jda_001';
    const gaps = generateRoleSkillMap(roleId);
    const plan = generateWeeklyPlan(roleId, gaps, weekly_minutes || 240, horizon_weeks || 4);

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err: any) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, err.message, 500);
  }
}
