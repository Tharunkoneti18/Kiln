import { NextResponse } from 'next/server';
import { listPublishedLessons } from '@/src/lib/tutor/tutor-service';

export async function GET() {
  try {
    const lessons = await listPublishedLessons();
    return NextResponse.json({ lessons });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
