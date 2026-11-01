export type ApplicationStage =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'technical'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface ApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  stage: ApplicationStage;
  applied_at: string | null;
  response_date: string | null;
  outcome: string | null;
  notes: string | null;
}

export interface FunnelMetrics {
  total_applications: number;
  in_progress: number;
  screening_count: number;
  screening_conversion_rate: number;
  technical_count: number;
  offer_count: number;
  offer_rate: number;
  rejected_at_screening: number;
  avg_response_latency_days: number;
}

export interface FunnelSummary {
  sample_size: number;
  is_directional: boolean;
  metrics: FunnelMetrics;
  caveats: string[];
}

export function computeFunnelMetrics(applications: ApplicationRecord[]): FunnelSummary {
  const sampleSize = applications.length;
  const isDirectional = sampleSize < 5;
  const caveats: string[] = [];

  if (isDirectional) {
    caveats.push(
      'Sample size under 5; metrics are directional and should not be treated as statistically reliable.'
    );
  }

  if (sampleSize === 0) {
    return {
      sample_size: 0,
      is_directional: true,
      metrics: {
        total_applications: 0,
        in_progress: 0,
        screening_count: 0,
        screening_conversion_rate: 0,
        technical_count: 0,
        offer_count: 0,
        offer_rate: 0,
        rejected_at_screening: 0,
        avg_response_latency_days: 0,
      },
      caveats,
    };
  }

  let inProgress = 0;
  let screeningCount = 0;
  let technicalCount = 0;
  let offerCount = 0;
  let rejectedAtScreening = 0;
  const latencies: number[] = [];

  for (const app of applications) {
    if (app.stage === 'saved') continue;

    if (['applied', 'screening', 'technical', 'interview'].includes(app.stage)) {
      inProgress++;
    }

    if (['screening', 'technical', 'interview', 'offer'].includes(app.stage)) {
      screeningCount++;
    }

    if (['technical', 'interview', 'offer'].includes(app.stage)) {
      technicalCount++;
    }

    if (app.stage === 'offer') {
      offerCount++;
    }

    if (app.stage === 'rejected' && (app.outcome === 'rejected_resume' || !app.response_date)) {
      rejectedAtScreening++;
    }

    if (app.applied_at && app.response_date) {
      const start = new Date(app.applied_at).getTime();
      const end = new Date(app.response_date).getTime();
      const diffDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      latencies.push(diffDays);
    }
  }

  const avgLatency =
    latencies.length > 0
      ? Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1))
      : 0;

  const screeningRate = Number((screeningCount / sampleSize).toFixed(2));
  const offerRate = Number((offerCount / sampleSize).toFixed(2));

  return {
    sample_size: sampleSize,
    is_directional: isDirectional,
    metrics: {
      total_applications: sampleSize,
      in_progress: inProgress,
      screening_count: screeningCount,
      screening_conversion_rate: screeningRate,
      technical_count: technicalCount,
      offer_count: offerCount,
      offer_rate: offerRate,
      rejected_at_screening: rejectedAtScreening,
      avg_response_latency_days: avgLatency,
    },
    caveats,
  };
}
