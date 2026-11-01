import { NextRequest, NextResponse } from 'next/server';
import { submitQuizAnswer } from '@/src/lib/tutor/tutor-service';

const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function POST(req: NextRequest | Request) {
  try {
    const body = await req.json();
    const { lesson_id, question_id, selected_option_index, user_id, lesson_version } = body;

    if (!lesson_id || !question_id || selected_option_index === undefined) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'lesson_id, question_id, and selected_option_index are required',
          },
        },
        { status: 422 }
      );
    }

    const evaluation = await submitQuizAnswer({
      user_id: user_id || DEFAULT_USER_ID,
      lesson_id,
      lesson_version: lesson_version || 1,
      question_id,
      selected_option_index,
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
