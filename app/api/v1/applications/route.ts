import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createErrorResponse, AppError } from '@/lib/api/errors';
import { z } from 'zod';

const ApplicationCreateSchema = z.object({
  company: z.string().min(1),
  role_title: z.string().min(1),
  stage: z.enum(['saved', 'applied', 'screening', 'technical', 'interview', 'offer', 'rejected']).default('applied'),
  applied_at: z.string().nullable().optional(),
  response_date: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: apps, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: apps || [] });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ApplicationCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid application data', 400, parsed.error.format());
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Mock mode fallback for local test
      return NextResponse.json({
        success: true,
        data: {
          id: `app-local-${Date.now()}`,
          user_id: 'mock-user',
          ...parsed.data,
          created_at: new Date().toISOString(),
        },
      });
    }

    const { data, error } = await (supabase.from('applications') as any)
      .insert({
        user_id: user.id,
        ...parsed.data,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
