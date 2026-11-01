import { NextRequest, NextResponse } from 'next/server';
import { sampleArtifacts } from '@/src/lib/career/portfolio-service';
import { generatePortfolioSuggestions } from '@/src/lib/career/plan-generator';
import { generateRoleSkillMap } from '@/src/lib/career/role-service';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';

export async function GET(req: NextRequest) {
  const gaps = generateRoleSkillMap('role_jda_001');
  const suggestions = generatePortfolioSuggestions(gaps);

  return NextResponse.json({
    artifacts: sampleArtifacts,
    suggestions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, uri, skill_ids, description } = body;

    if (!title || !uri) {
      return apiError(ApiErrorCode.UNPROCESSABLE_ENTITY, 'Title and URI are required', 422);
    }

    const newArtifact = {
      id: `art_${Date.now()}`,
      userId: 'anonymous_user',
      title,
      description: description || '',
      uri,
      skill_ids: skill_ids || [],
      visibility: 'private',
      verified_state: 'self_reported',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ artifact: newArtifact }, { status: 201 });
  } catch (err: any) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, err.message, 500);
  }
}
