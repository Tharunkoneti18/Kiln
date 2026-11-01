import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewSession } from '@/lib/career/interview-engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createErrorResponse } from '@/lib/api/errors';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: sessions, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: sessions || [] });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roleId = body.role_id || 'general-analyst';
    const skills = body.target_skills || ['sql', 'data-modeling', 'communication'];

    const session = generateInterviewSession(roleId, skills);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await (supabase.from('interview_sessions') as any)
        .insert({
          user_id: user.id,
          role_id: body.role_id && body.role_id.includes('-') && body.role_id.length === 36 ? body.role_id : null,
          status: 'in_progress',
          rubric_version: '1.0',
          questions: session.questions as any,
          responses: [] as any,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            ...session,
            id: (data as any).id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
