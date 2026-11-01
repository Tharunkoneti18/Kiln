import { describe, it, expect } from 'vitest';
import { GET as getLessons } from '@/app/api/v1/lessons/route';
import { GET as getLessonById } from '@/app/api/v1/lessons/[id]/route';
import {
  GET as getLessonProgressRoute,
  PUT as putLessonProgressRoute,
} from '@/app/api/v1/lessons/[id]/progress/route';
import { POST as generateTutorLessonRoute } from '@/app/api/v1/tutor/generate/route';
import { POST as evaluateQuizRoute } from '@/app/api/v1/tutor/quiz/route';

describe('Tutor & Lesson API Endpoints', () => {
  it('GET /api/v1/lessons returns published lessons list', async () => {
    const res = await getLessons();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lessons).toBeInstanceOf(Array);
    expect(body.lessons.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/lessons/[id] returns lesson manifest', async () => {
    const req = new Request('http://localhost:3000/api/v1/lessons/sql-joins-v1');
    const res = await getLessonById(req, { params: Promise.resolve({ id: 'sql-joins-v1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lesson).toBeDefined();
    expect(body.lesson.lesson_id).toBe('sql-joins-v1');
  });

  it('PUT & GET /api/v1/lessons/[id]/progress persists and reads checkpoint', async () => {
    const putReq = new Request('http://localhost:3000/api/v1/lessons/sql-joins-v1/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segment_id: 'seg_intro',
        position_ms: 15000,
        event_cursor: 2,
        board_snapshot: { ready: true },
      }),
    });

    const putRes = await putLessonProgressRoute(putReq, {
      params: Promise.resolve({ id: 'sql-joins-v1' }),
    });
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.progress.position_ms).toBe(15000);

    // Read progress
    const getReq = new Request('http://localhost:3000/api/v1/lessons/sql-joins-v1/progress');
    const getRes = await getLessonProgressRoute(getReq, {
      params: Promise.resolve({ id: 'sql-joins-v1' }),
    });
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.progress.position_ms).toBe(15000);
  });

  it('POST /api/v1/tutor/generate dynamically creates a 3D lesson for any skill/concept', async () => {
    const req = new Request('http://localhost:3000/api/v1/tutor/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'Star Schema & Snowflake Dimensional Modeling',
        skill_id: 'data-modeling',
        target_role: 'Data Architect',
        estimated_minutes: 25,
      }),
    });

    const res = await generateTutorLessonRoute(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.lesson).toBeDefined();
    expect(body.lesson.skill_ids).toContain('data-modeling');
    expect(body.lesson.segments[0].avatar_gestures).toBeDefined();
  });

  it('POST /api/v1/tutor/quiz evaluates answer and emits learning event', async () => {
    const req = new Request('http://localhost:3000/api/v1/tutor/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: 'sql-joins-v1',
        question_id: 'q1',
        selected_option_index: 1,
      }),
    });

    const res = await evaluateQuizRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.is_correct).toBe(true);
    expect(body.learning_event_id).toBeDefined();
  });
});
