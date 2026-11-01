import { describe, it, expect } from 'vitest';
import {
  generateTutorLessonForConcept,
  validateTutorLessonManifest,
  calculatePlaybackStateAtOffset,
} from '@/src/lib/tutor/lesson-pipeline';

describe('Tutor 3D Lesson Generation & Runtime Pipeline', () => {
  it('generates a full structured 3D tutor lesson with synchronized whiteboard and avatar gestures', async () => {
    const lesson = await generateTutorLessonForConcept({
      concept: 'SQL Window Functions (ROW_NUMBER & PARTITION BY)',
      skill_id: 'sql',
      target_role: 'Senior Data Analyst',
      estimated_minutes: 20,
    });

    expect(lesson).toBeDefined();
    expect(lesson.lesson_id).toContain('sql');
    expect(lesson.title).toContain('Window Functions');
    expect(lesson.skill_ids).toContain('sql');
    expect(lesson.segments.length).toBeGreaterThanOrEqual(2);

    // Verify first segment has narration, synchronized whiteboard events, and avatar gestures
    const firstSegment = lesson.segments[0];
    expect(firstSegment.segment_id).toBeDefined();
    expect(firstSegment.narration_text.length).toBeGreaterThan(20);
    expect(firstSegment.duration_ms).toBeGreaterThan(10000);
    expect(firstSegment.board_events.length).toBeGreaterThanOrEqual(1);

    // Verify 3D avatar gesture keyframes
    expect(firstSegment.avatar_gestures).toBeDefined();
    expect(firstSegment.avatar_gestures.length).toBeGreaterThanOrEqual(1);
    const gesture = firstSegment.avatar_gestures[0];
    expect(['speaking', 'pointing', 'idle', 'listening']).toContain(gesture.state);

    // Verify quiz questions are included with explanations and skill links
    expect(lesson.quiz.length).toBeGreaterThanOrEqual(1);
    expect(lesson.quiz[0].options.length).toBeGreaterThanOrEqual(2);
    expect(lesson.quiz[0].correct_option_index).toBeGreaterThanOrEqual(0);
    expect(lesson.quiz[0].explanation).toBeDefined();
  });

  it('validates lesson manifest against the strict Zod schema', async () => {
    const lesson = await generateTutorLessonForConcept({
      concept: 'Dimensional Modeling & Star Schema',
      skill_id: 'data-modeling',
      target_role: 'Analytics Engineer',
      estimated_minutes: 25,
    });

    const validationResult = validateTutorLessonManifest(lesson);
    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.lesson_id).toBe(lesson.lesson_id);
  });

  it('calculates deterministic playback board events and avatar gesture at any offset_ms', async () => {
    const lesson = await generateTutorLessonForConcept({
      concept: 'PostgreSQL Indexing & B-Trees',
      skill_id: 'sql',
      target_role: 'Backend Engineer',
      estimated_minutes: 15,
    });

    const segment = lesson.segments[0];
    // Offset early in segment
    const earlyState = calculatePlaybackStateAtOffset(segment, 2500);
    expect(earlyState).toBeDefined();
    expect(earlyState.activeBoardEvents).toBeInstanceOf(Array);
    expect(earlyState.currentAvatarGesture).toBeDefined();

    // Offset later in segment
    const laterState = calculatePlaybackStateAtOffset(segment, segment.duration_ms - 1000);
    expect(laterState.activeBoardEvents.length).toBeGreaterThanOrEqual(earlyState.activeBoardEvents.length);
  });
});
