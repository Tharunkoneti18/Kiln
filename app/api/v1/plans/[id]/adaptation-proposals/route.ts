import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generatePlanAdaptationProposal } from '@/lib/career/adaptation-engine';
import { computeFunnelMetrics, type ApplicationRecord } from '@/lib/career/application-service';
import { createErrorResponse, AppError } from '@/lib/api/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let planItems: any[] = [];
    let apps: ApplicationRecord[] = [];

    if (user) {
      const { data: planData } = await supabase
        .from('plan_items')
        .select('*')
        .eq('plan_id', planId);
      if (planData) planItems = planData;

      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);
      if (appsData) apps = appsData as ApplicationRecord[];
    }

    const funnel = computeFunnelMetrics(apps);
    const proposal = generatePlanAdaptationProposal(
      { id: planId, version: 1, items: planItems },
      funnel
    );

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const body = await req.json();

    if (body.action !== 'approve' || !body.diff) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Explicit user action "approve" and diff required to adapt plan',
        400
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && planId.length === 36) {
      // Add proposed additions
      for (const addition of body.diff.additions || []) {
        await (supabase.from('plan_items') as any).insert({
          plan_id: planId,
          week: addition.week,
          title: addition.title,
          skill_ids: addition.skill_ids,
          rationale: addition.rationale,
          minutes: addition.minutes,
          lesson_id: addition.lesson_id || null,
          status: 'pending',
        });
      }

      // Bump plan version
      const { data: currentPlan } = await supabase
        .from('learning_plans')
        .select('version')
        .eq('id', planId)
        .single();

      if (currentPlan) {
        await (supabase.from('learning_plans') as any)
          .update({
            version: (currentPlan as any).version + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', planId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Plan adaptation diff successfully approved and applied',
    });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
