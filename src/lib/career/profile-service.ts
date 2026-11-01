import { parseResumeText, ExtractedSkillEvidence } from './resume-parser';
import type { Database } from '@/src/types/database.generated';

export interface SaveProfileEvidenceInput {
  userId: string;
  summary: string;
  claims: Array<{
    skill_id: string;
    kind: string;
    excerpt: string;
    confidence: number;
    source_locator?: Record<string, unknown>;
    confirmedByUser: boolean;
  }>;
}

export async function processProfileImport(userId: string, rawText: string) {
  const parsed = parseResumeText(rawText);
  return {
    job_id: `import_${Date.now()}`,
    status: 'completed',
    summary: parsed.summary,
    claims: parsed.claims,
    candidate: parsed.candidate,
  };
}
