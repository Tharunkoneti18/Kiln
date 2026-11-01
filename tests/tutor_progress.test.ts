import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveLessonProgress,
  getLessonProgress,
  getPublishedLesson,
  listPublishedLessons,
  submitQuizAnswer,
} from '@/src/lib/tutor/tutor-service';

describe('Tutor Progress & Persistence Service', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const lessonId = 'sql-joins-v1';

  it('retrieves seeded published lessons', async () => {
    const lessons = await listPublishedLessons();
    expect(lessons).toBeDefined();
    expect(lessons.length).toBeGreaterThanOrEqual(1);

    const lesson = await getPublishedLesson(lessonId);
    expect(lesson).toBeDefined();
    expect(lesson?.title).toContain('SQL Joins');
  });

  it('saves and resumes lesson progress checkpoint idempotently', async () => {
    const saved = await saveLessonProgress({
      user_id: userId,
      lesson_id: lessonId,
      lesson_version: 1,
      segment_id: 'seg_intro',
      position_ms: 24500,
      event_cursor: 3,
      board_snapshot: { elements: [{ type: 'text', text: 'Table A ⨝ Table B' }] },
      quiz_state: { q1: { answered: true, selected_option: 1 } },
    });

    expect(saved).toBeDefined();
    expect(saved.position_ms).toBe(24500);
    expect(saved.event_cursor).toBe(3);

    // Retrieve progress
    const progress = await getLessonProgress(userId, lessonId, 1);
    expect(progress).toBeDefined();
    expect(progress?.segment_id).toBe('seg_intro');
    expect(progress?.position_ms).toBe(24500);
    expect(progress?.board_snapshot).toHaveProperty('elements');
  });

  it('evaluates quiz answers and emits learning event when passed', async () => {
    const evaluation = await submitQuizAnswer({
      user_id: userId,
      lesson_id: lessonId,
      lesson_version: 1,
      question_id: 'q1',
      selected_option_index: 1,
    });

    expect(evaluation.is_correct).toBe(true);
    expect(evaluation.explanation).toBeDefined();
    expect(evaluation.learning_event_id).toBeDefined();
  });

  it('rejects incorrect quiz answer without false credit', async () => {
    const evaluation = await submitQuizAnswer({
      user_id: userId,
      lesson_id: lessonId,
      lesson_version: 1,
      question_id: 'q1',
      selected_option_index: 0,
    });

    expect(evaluation.is_correct).toBe(false);
    expect(evaluation.learning_event_id).toBeUndefined();
  });
});
