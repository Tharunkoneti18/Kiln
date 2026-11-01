import { NextRequest, NextResponse } from 'next/server';
import { generateRoleSkillMap } from '@/src/lib/career/role-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Curated demo evidence
  const demoEvidence = [
    { skill_id: 'spreadsheets', state: 'Demonstrated' as const, confidence: 0.9, excerpt: 'Advanced Excel & financial modeling' },
    { skill_id: 'data-visualization', state: 'Supported' as const, confidence: 0.75, excerpt: 'Built Tableau KPI charts' },
  ];

  const skillMap = generateRoleSkillMap(id, demoEvidence);

  return NextResponse.json({
    role_id: id,
    role_version: 1,
    skills: skillMap,
  });
}
