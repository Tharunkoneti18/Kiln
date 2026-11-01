import { NextRequest, NextResponse } from 'next/server';
import { LearningEventSchema } from '@/lib/contracts/events';
import { processLearningEvent } from '@/lib/career/learning-event-consumer';
import { createValidationErrorResponse, createErrorResponse } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LearningEventSchema.safeParse(body);

    if (!parsed.success) {
      return createValidationErrorResponse(parsed.error);
    }

    const result = await processLearningEvent(parsed.data);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 202 }
    );
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
