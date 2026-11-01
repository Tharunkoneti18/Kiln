import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { LearningEventSchema } from '../src/lib/contracts/events';
import { LessonManifestSchema } from '../src/lib/contracts/lesson-manifest';
import { TargetRoleFixtureSchema } from '../src/lib/contracts/career';

describe('Shared Contracts & Fixtures (Part B Unblocking)', () => {
  it('validates a learning event envelope', () => {
    const validEvent = {
      event_id: '11111111-1111-1111-1111-111111111111',
      event_type: 'lesson.completed',
      schema_version: 1,
      user_id: '22222222-2222-2222-2222-222222222222',
      aggregate_id: 'sql-joins-v1',
      occurred_at: new Date().toISOString(),
      idempotency_key: 'idem-12345',
      payload: {
        lesson_id: 'sql-joins-v1',
        lesson_version: 1,
        skill_ids: ['sql', 'data-modeling'],
        score: 1.0,
      },
    };

    const parsed = LearningEventSchema.safeParse(validEvent);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid event without required envelope fields', () => {
    const invalidEvent = {
      event_type: 'lesson.completed',
      // missing event_id, user_id, idempotency_key
    };

    const parsed = LearningEventSchema.safeParse(invalidEvent);
    expect(parsed.success).toBe(false);
  });

  it('validates the seed lesson manifest fixture for Part B', () => {
    const fixturePath = path.resolve(__dirname, '../content/lessons/sql-joins-v1.json');
    expect(fs.existsSync(fixturePath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const parsed = LessonManifestSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.lesson_id).toBe('sql-joins-v1');
      expect(parsed.data.segments.length).toBeGreaterThan(0);
      expect(parsed.data.quiz.length).toBeGreaterThan(0);
    }
  });

  it('validates the curated target role fixture', () => {
    const rolePath = path.resolve(__dirname, '../content/roles/junior-data-analyst.json');
    expect(fs.existsSync(rolePath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(rolePath, 'utf8'));
    const parsed = TargetRoleFixtureSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe('Junior Data Analyst');
      expect(parsed.data.required_skills.length).toBeGreaterThan(0);
    }
  });

  it('verifies generated database types file exists', () => {
    const typesPath = path.resolve(__dirname, '../src/types/database.generated.ts');
    expect(fs.existsSync(typesPath)).toBe(true);
  });
});
