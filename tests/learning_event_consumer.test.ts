import { describe, it, expect, beforeEach } from 'vitest';
import { processLearningEvent, clearProcessedEventsCache } from '../src/lib/career/learning-event-consumer';
import type { LearningEvent } from '../src/lib/contracts/events';

describe('Tutor Learning Event Consumer (Part B Handoff)', () => {
  beforeEach(() => {
    clearProcessedEventsCache();
  });

  const sampleEvent: LearningEvent = {
    event_id: '99999999-9999-9999-9999-999999999999',
    event_type: 'lesson.completed',
    schema_version: 1,
    user_id: '88888888-8888-8888-8888-888888888888',
    aggregate_id: 'progress_sql_001',
    occurred_at: new Date().toISOString(),
    idempotency_key: 'idem_key_abc',
    payload: {
      lesson_id: 'sql-joins-v1',
      lesson_version: 1,
      skill_ids: ['sql', 'data-modeling'],
      score: 1.0,
      evidence_type: 'assessment',
    },
  };

  it('processes a new lesson.completed event, marking plan item and skills as Demonstrated', async () => {
    const result = await processLearningEvent(sampleEvent);

    expect(result.accepted).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.affected_skills).toContain('sql');
    expect(result.affected_skills).toContain('data-modeling');
    expect(result.plan_item_updated).toBe(true);
  });

  it('handles duplicate events idempotently without double-crediting', async () => {
    // First emission
    const first = await processLearningEvent(sampleEvent);
    expect(first.duplicate).toBe(false);

    // Network retry emission (same event_id and idempotency_key)
    const second = await processLearningEvent(sampleEvent);
    expect(second.accepted).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(second.plan_item_updated).toBe(false);
  });

  it('processes lesson.check_submitted events and records quiz evidence', async () => {
    const checkEvent: LearningEvent = {
      event_id: '77777777-7777-7777-7777-777777777777',
      event_type: 'lesson.check_submitted',
      schema_version: 1,
      user_id: '88888888-8888-8888-8888-888888888888',
      aggregate_id: 'progress_sql_001',
      occurred_at: new Date().toISOString(),
      idempotency_key: 'idem_key_check_1',
      payload: {
        lesson_id: 'sql-joins-v1',
        lesson_version: 1,
        skill_ids: ['sql'],
        check_id: 'q1',
        score: 1.0,
        evidence_type: 'assessment',
      },
    };

    const result = await processLearningEvent(checkEvent);
    expect(result.accepted).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.affected_skills).toContain('sql');
  });
});
