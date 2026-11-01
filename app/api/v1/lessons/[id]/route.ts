import { NextRequest, NextResponse } from 'next/server';
import { getPublishedLesson } from '@/src/lib/tutor/tutor-service';

export async function GET(
  req: NextRequest | Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const lesson = await getPublishedLesson(id);

    if (!lesson) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Lesson ${id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
