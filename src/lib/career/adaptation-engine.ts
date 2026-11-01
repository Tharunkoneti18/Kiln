import { randomUUID } from 'crypto';
import type { FunnelSummary } from './application-service';

export interface PlanItemDiff {
  id?: string;
  week: number;
  title: string;
  skill_ids: string[];
  rationale: string;
  minutes: number;
  lesson_id?: string;
}

export interface AdaptationProposal {
  id: string;
  plan_id: string;
  status: 'pending_user_approval' | 'approved' | 'rejected';
  rationale: string;
  diff: {
    additions: PlanItemDiff[];
    removals: string[];
    modifications: Array<{
      item_id: string;
      changes: Record<string, any>;
    }>;
  };
  auto_applied: boolean;
  created_at: string;
}

export function generatePlanAdaptationProposal(
  activePlan: { id: string; version: number; items: any[] },
  funnel: FunnelSummary
): AdaptationProposal {
  const proposalId = `prop-${randomUUID()}`;
  const additions: PlanItemDiff[] = [];
  const removals: string[] = [];
  const modifications: Array<{ item_id: string; changes: Record<string, any> }> = [];
  let rationale = 'Regular weekly plan calibration based on current learning and job outcomes.';

  if (funnel.metrics.screening_conversion_rate < 0.4 || funnel.metrics.rejected_at_screening >= 3) {
    rationale =
      'Early funnel drop-off detected: Screening rate is below 40%. Adapting learning plan to prioritize tangible portfolio evidence and resume impact bullets.';
    additions.push({
      week: 3,
      title: 'Resume & Portfolio Impact Alignment Drill',
      skill_ids: ['communication', 'portfolio-evidence'],
      rationale: 'Attach verified dashboard artifact link and rewrite resume bullets with business metrics.',
      minutes: 90,
    });
    additions.push({
      week: 4,
      title: 'Executive Presentation & Behavioral Mock Interview',
      skill_ids: ['communication'],
      rationale: 'Practice 1-4 anchored STAR framework response delivery for recruiter screening calls.',
      minutes: 60,
    });
  } else if (funnel.metrics.offer_rate === 0 && funnel.metrics.technical_count >= 2) {
    rationale =
      'Technical round bottleneck detected. Proposing deep-dive system design and advanced SQL join edge-case practice.';
    additions.push({
      week: 2,
      title: 'Advanced SQL Query Tuning & O-notation Workshop',
      skill_ids: ['sql'],
      rationale: 'Focus on indexing, execution plans, and window function partitioning under load.',
      minutes: 120,
      lesson_id: 'sql-joins-v1',
    });
  } else {
    additions.push({
      week: 3,
      title: 'Targeted Skill Deepening',
      skill_ids: ['sql', 'data-modeling'],
      rationale: 'Reinforce foundational data manipulation patterns before next application wave.',
      minutes: 60,
    });
  }

  return {
    id: proposalId,
    plan_id: activePlan.id,
    status: 'pending_user_approval',
    rationale,
    diff: {
      additions,
      removals,
      modifications,
    },
    auto_applied: false,
    created_at: new Date().toISOString(),
  };
}
