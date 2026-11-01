import { describe, it, expect } from 'vitest';
import { parseResumeText, extractSkillEvidenceFromText } from '../src/lib/career/resume-parser';

describe('Resume & Profile Intake Engine', () => {
  const sampleResume = `
John Doe
Email: john@example.com | Phone: 555-0199

Professional Experience:
Data Analyst at Acme Corp (2022 - Present)
- Developed complex SQL queries across PostgreSQL databases to generate daily retention metrics.
- Built interactive Tableau and Power BI dashboards communicating KPIs to executive leadership.
- Wrote automated Python scripts (Pandas) to clean and transform 50k+ rows of marketing data.

Education:
B.S. in Computer Science, State University (2021)
`;

  it('extracts structured skill evidence with source excerpts and confidence ratings', () => {
    const evidence = extractSkillEvidenceFromText(sampleResume);

    expect(evidence.length).toBeGreaterThan(0);

    const sqlEvidence = evidence.find(e => e.skill_id === 'sql');
    expect(sqlEvidence).toBeDefined();
    expect(sqlEvidence?.excerpt).toContain('Developed complex SQL queries');
    expect(sqlEvidence?.confidence).toBeGreaterThanOrEqual(0.7);
    expect(sqlEvidence?.source_locator).toBeDefined();

    const pythonEvidence = evidence.find(e => e.skill_id === 'python');
    expect(pythonEvidence).toBeDefined();
    expect(pythonEvidence?.excerpt).toContain('Python scripts');
  });

  it('marks extracted claims as unverified (requiring human confirmation)', () => {
    const result = parseResumeText(sampleResume);

    expect(result.summary).toBeDefined();
    expect(result.claims.length).toBeGreaterThan(0);
    // Every claim must start unverified
    for (const claim of result.claims) {
      expect(claim.verified_at).toBeNull();
    }
  });

  it('safely handles empty or minimal input without crashing', () => {
    const emptyResult = parseResumeText('');
    expect(emptyResult.claims).toEqual([]);
    expect(emptyResult.summary).toBe('');
  });
});
