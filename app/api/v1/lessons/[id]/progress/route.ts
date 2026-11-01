import { NextRequest, NextResponse } from 'next/server';
import { getLessonProgress, saveLessonProgress } from '@/src/lib/tutor/tutor-service';

const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(
  req: NextRequest | Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const progress = await getLessonProgress(DEFAULT_USER_ID, id);
    return NextResponse.json({ progress: progress || null });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest | Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const progress = await saveLessonProgress({
      user_id: body.user_id || DEFAULT_USER_ID,
      lesson_id: id,
      lesson_version: body.lesson_version || 1,
      segment_id: body.segment_id,
      position_ms: body.position_ms,
      event_cursor: body.event_cursor,
      board_snapshot: body.board_snapshot,
      quiz_state: body.quiz_state,
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
