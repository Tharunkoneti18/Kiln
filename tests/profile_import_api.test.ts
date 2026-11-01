import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/v1/profile/imports/route';
import { NextRequest } from 'next/server';

describe('Profile Import & Parsing API Endpoint', () => {
  const sampleResume = `
ALEX CHEN
Senior Analytics Engineer | alex.chen@example.com

PROFESSIONAL EXPERIENCE
Data Engineer at FinTech Labs (2022 - Present)
• Built scalable batch and streaming ETL pipelines using dbt, Snowflake, and Apache Airflow.
• Optimized PostgreSQL queries and warehouse schemas.

Data Analyst at HealthMetrics (2020 - 2022)
• Analyzed healthcare patient cohorts in Python and Excel.

EDUCATION
B.S. in Computer Science, University of California (2020)
`;

  it('successfully processes JSON resume text and returns structured candidate & skill claims', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/profile/imports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sampleResume,
        user_id: 'test_user_alex',
        file_name: 'alex_chen_resume.txt',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('completed');
    expect(data.file_name).toBe('alex_chen_resume.txt');
    expect(data.candidate).toBeDefined();
    expect(data.candidate.name).toBe('ALEX CHEN');
    expect(data.candidate.experience.length).toBeGreaterThanOrEqual(1);
    expect(data.claims.length).toBeGreaterThanOrEqual(3);

    const skillIds = data.claims.map((c: any) => c.skill_id);
    expect(skillIds).toContain('sql');
    expect(skillIds).toContain('snowflake');
  });

  it('rejects requests with missing or empty text with 422 Unprocessable Entity', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/profile/imports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
