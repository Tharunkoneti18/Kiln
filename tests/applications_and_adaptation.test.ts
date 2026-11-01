import { describe, it, expect } from 'vitest';
import {
  computeFunnelMetrics,
  type ApplicationRecord,
} from '../src/lib/career/application-service';
import {
  generatePlanAdaptationProposal,
  type AdaptationProposal,
} from '../src/lib/career/adaptation-engine';

describe('Task 10: Application Tracker, Outcome Summaries & Adaptive Proposals', () => {
  const baseApp: ApplicationRecord = {
    id: 'app-1',
    user_id: 'user-123',
    company: 'Acme Corp',
    role_title: 'Junior Data Analyst',
    stage: 'applied',
    applied_at: '2026-10-01',
    response_date: null,
    outcome: null,
    notes: 'Submitted via company portal',
  };

  it('flags metrics as directional with explicit caveat when sample size is under 5 (n < 5)', () => {
    const apps: ApplicationRecord[] = [
      { ...baseApp, id: '1', stage: 'applied' },
      { ...baseApp, id: '2', stage: 'screening', response_date: '2026-10-05' },
      { ...baseApp, id: '3', stage: 'rejected', response_date: '2026-10-08', outcome: 'no_offer' },
    ];

    const summary = computeFunnelMetrics(apps);

    expect(summary.sample_size).toBe(3);
    expect(summary.is_directional).toBe(true);
    expect(summary.caveats.length).toBeGreaterThan(0);
    expect(summary.caveats[0]).toContain('Sample size under 5');
  });

  it('computes complete funnel conversion rates and response latency when sample size n >= 5', () => {
    const apps: ApplicationRecord[] = [
      { ...baseApp, id: '1', stage: 'applied', applied_at: '2026-10-01' },
      { ...baseApp, id: '2', stage: 'screening', applied_at: '2026-10-01', response_date: '2026-10-05' },
      { ...baseApp, id: '3', stage: 'technical', applied_at: '2026-10-02', response_date: '2026-10-08' },
      { ...baseApp, id: '4', stage: 'offer', applied_at: '2026-10-01', response_date: '2026-10-15', outcome: 'accepted' },
      { ...baseApp, id: '5', stage: 'rejected', applied_at: '2026-10-03', response_date: '2026-10-07', outcome: 'rejected_resume' },
      { ...baseApp, id: '6', stage: 'rejected', applied_at: '2026-10-04', response_date: '2026-10-12', outcome: 'rejected_technical' },
    ];

    const summary = computeFunnelMetrics(apps);

    expect(summary.sample_size).toBe(6);
    expect(summary.is_directional).toBe(false);
    expect(summary.metrics.total_applications).toBe(6);
    expect(summary.metrics.screening_conversion_rate).toBeGreaterThan(0);
    expect(summary.metrics.offer_rate).toBeCloseTo(1 / 6, 2);
    expect(summary.metrics.avg_response_latency_days).toBeGreaterThan(0);
  });

  it('generates a transparent plan adaptation proposal with visual diff and explicit user approval guard', () => {
    const activePlan = {
      id: 'plan-xyz',
      version: 1,
      items: [
        {
          id: 'item-1',
          week: 1,
          title: 'Advanced Window Functions',
          skill_ids: ['sql'],
          status: 'completed',
          minutes: 90,
        },
        {
          id: 'item-2',
          week: 2,
          title: 'Star Schema Modeling',
          skill_ids: ['data-modeling'],
          status: 'pending',
          minutes: 120,
        },
      ],
    };

    const funnel = {
      sample_size: 6,
      is_directional: false,
      metrics: {
        total_applications: 6,
        rejected_at_screening: 4,
        screening_conversion_rate: 0.33,
        offer_rate: 0,
        avg_response_latency_days: 5,
      },
      caveats: [],
    };

    const proposal: AdaptationProposal = generatePlanAdaptationProposal(activePlan as any, funnel as any);

    expect(proposal.plan_id).toBe('plan-xyz');
    expect(proposal.status).toBe('pending_user_approval');
    expect(proposal.rationale.length).toBeGreaterThan(20);
    expect(proposal.diff.additions.length).toBeGreaterThan(0);

    // Verifies that silent automatic mutations are blocked
    expect(proposal.auto_applied).toBe(false);
    expect(proposal.diff.additions[0].title).toBeDefined();
    expect(proposal.diff.additions[0].rationale).toBeDefined();
  });
});
