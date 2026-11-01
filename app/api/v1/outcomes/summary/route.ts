import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { computeFunnelMetrics, type ApplicationRecord } from '@/lib/career/application-service';
import { createErrorResponse } from '@/lib/api/errors';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const summary = computeFunnelMetrics([]);
      return NextResponse.json({ success: true, data: summary });
    }

    const { data: apps, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const summary = computeFunnelMetrics((apps || []) as ApplicationRecord[]);

    // Cache calculation in outcome_summaries table if user authenticated
    await (supabase.from('outcome_summaries') as any).insert({
      user_id: user.id,
      window: 'all_time',
      sample_size: summary.sample_size,
      metrics: summary.metrics as any,
      caveats: summary.caveats,
      proposed_actions: [] as any,
    });

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return createErrorResponse(err);
  }
}
