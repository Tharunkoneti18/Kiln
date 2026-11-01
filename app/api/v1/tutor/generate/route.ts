import { NextRequest, NextResponse } from 'next/server';
import { generateTutorLessonForConcept } from '@/src/lib/tutor/lesson-pipeline';
import { registerLesson } from '@/src/lib/tutor/tutor-service';

export async function POST(req: NextRequest | Request) {
  try {
    const body = await req.json();
    const { concept, skill_id, target_role, estimated_minutes } = body;

    if (!concept || !skill_id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Both concept and skill_id are required to generate a tutor lesson',
          },
        },
        { status: 422 }
      );
    }

    const lessonManifest = await generateTutorLessonForConcept({
      concept,
      skill_id,
      target_role: target_role || 'Target Role',
      estimated_minutes: estimated_minutes || 20,
    });

    // Register lesson in catalog/database
    await registerLesson(lessonManifest);

    return NextResponse.json({ lesson: lessonManifest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
