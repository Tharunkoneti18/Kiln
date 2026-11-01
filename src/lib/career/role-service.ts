import fs from 'fs';
import path from 'path';
import { calculateSkillGapMap, SkillGapItem, UserEvidenceInput } from './skill-gap-engine';
import { TargetRoleFixtureSchema, TargetRoleFixture } from '../contracts/career';

export function getCuratedRole(roleId: string = 'role_jda_001'): TargetRoleFixture {
  const rolePath = path.resolve(process.cwd(), 'content/roles/junior-data-analyst.json');
  if (fs.existsSync(rolePath)) {
    const raw = JSON.parse(fs.readFileSync(rolePath, 'utf8'));
    return TargetRoleFixtureSchema.parse(raw);
  }

  return {
    id: roleId,
    title: 'Junior Data Analyst',
    region: 'US',
    level: 'entry',
    description: 'Junior Data Analyst analyzing SQL databases and building dashboards.',
    required_skills: [
      { skill_id: 'sql', canonical_name: 'SQL (Structured Query Language)', importance: 1.0 },
      { skill_id: 'spreadsheets', canonical_name: 'Advanced Spreadsheets', importance: 0.8 },
      { skill_id: 'data-visualization', canonical_name: 'Data Visualization', importance: 0.9 },
      { skill_id: 'data-communication', canonical_name: 'Technical & Data Communication', importance: 0.7 },
    ],
  };
}

export function generateRoleSkillMap(roleId: string, userEvidence: UserEvidenceInput[] = []): SkillGapItem[] {
  const role = getCuratedRole(roleId);
  return calculateSkillGapMap(role.required_skills, userEvidence);
}
