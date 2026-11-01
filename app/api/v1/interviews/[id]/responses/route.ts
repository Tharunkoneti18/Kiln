import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateInterviewResponse,
  summarizeInterviewSession,
  type InterviewQuestion,
  type InterviewResponseEvaluation,
} from '@/lib/career/interview-engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createErrorResponse, AppError } from '@/lib/api/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();

    if (!body.response_text || !body.question) {
      throw new AppError('VALIDATION_ERROR', 'Missing question or response_text in payload', 400);
    }

    const question = body.question as InterviewQuestion;
    const responseText = body.response_text as string;

    const evaluation: InterviewResponseEvaluation = evaluateInterviewResponse(question, responseText);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && sessionId.length === 36) {
      const { data: session } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (session) {
        const sessionAny = session as any;
        const existingResponses: InterviewResponseEvaluation[] = Array.isArray(sessionAny.responses)
          ? sessionAny.responses
          : [];

        const updatedResponses = [
          ...existingResponses.filter((r) => r.question_id !== question.id),
          evaluation,
        ];

        const summary = summarizeInterviewSession(sessionId, updatedResponses);

        await (supabase.from('interview_sessions') as any)
          .update({
            responses: updatedResponses as any,
            score_summary: summary as any,
            status: updatedResponses.length >= 5 ? 'completed' : 'in_progress',
          })
          .eq('id', sessionId);
      }
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
