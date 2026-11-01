export interface DashboardPlanItem {
  id: string;
  week: number;
  title: string;
  lesson_id?: string;
  status: 'pending' | 'in_progress' | 'completed';
  minutes: number;
}

export interface DashboardSkill {
  id: string;
  state: 'Demonstrated' | 'Supported' | 'Transferable' | 'Gap' | 'Unknown';
}

export interface PrimaryNextAction {
  title: string;
  type: 'tutor_lesson' | 'mock_interview' | 'portfolio_project' | 'general_practice';
  action_url: string;
  estimated_minutes: number;
}

export interface WeeklyProgress {
  completedMinutes: number;
  plannedMinutes: number;
  budgetMinutes: number;
  completionPercentage: number;
}

export interface SkillReadinessBreakdown {
  demonstratedCount: number;
  supportedCount: number;
  transferableCount: number;
  gapCount: number;
  unknownCount: number;
  totalSkills: number;
  readinessScore: number;
}

export function determinePrimaryNextAction(
  planItems: DashboardPlanItem[],
  targetRoleTitle: string
): PrimaryNextAction {
  // First look for in-progress or pending item
  const nextItem = planItems.find(
    (item) => item.status === 'in_progress' || item.status === 'pending'
  );

  if (nextItem) {
    if (nextItem.lesson_id) {
      return {
        title: nextItem.title,
        type: 'tutor_lesson',
        action_url: `/tutor?lessonId=${nextItem.lesson_id}`,
        estimated_minutes: nextItem.minutes,
      };
    }

    return {
      title: nextItem.title,
      type: 'general_practice',
      action_url: '/plan',
      estimated_minutes: nextItem.minutes,
    };
  }

  // Fallback if all plan items completed
  return {
    title: `Mock Interview Practice for ${targetRoleTitle || 'Target Role'}`,
    type: 'mock_interview',
    action_url: '/practice',
    estimated_minutes: 30,
  };
}

export function computeWeeklyProgress(
  planItems: DashboardPlanItem[],
  weeklyBudgetMinutes: number
): WeeklyProgress {
  const completedMinutes = planItems
    .filter((i) => i.status === 'completed')
    .reduce((sum, i) => sum + i.minutes, 0);

  const plannedMinutes = planItems.reduce((sum, i) => sum + i.minutes, 0);

  const percentage =
    plannedMinutes > 0
      ? Math.round((completedMinutes / plannedMinutes) * 100)
      : 0;

  return {
    completedMinutes,
    plannedMinutes,
    budgetMinutes: weeklyBudgetMinutes,
    completionPercentage: Math.min(100, percentage),
  };
}

export function computeSkillReadinessBreakdown(
  skills: DashboardSkill[]
): SkillReadinessBreakdown {
  if (skills.length === 0) {
    return {
      demonstratedCount: 0,
      supportedCount: 0,
      transferableCount: 0,
      gapCount: 0,
      unknownCount: 0,
      totalSkills: 0,
      readinessScore: 0,
    };
  }

  let dem = 0;
  let sup = 0;
  let trf = 0;
  let gap = 0;
  let unk = 0;

  for (const s of skills) {
    switch (s.state) {
      case 'Demonstrated':
        dem++;
        break;
      case 'Supported':
        sup++;
        break;
      case 'Transferable':
        trf++;
        break;
      case 'Gap':
        gap++;
        break;
      default:
        unk++;
        break;
    }
  }

  // Weighted score: Demonstrated=1.0, Supported=0.7, Transferable=0.5, Gap/Unknown=0
  const score = Math.round(
    ((dem * 1.0 + sup * 0.7 + trf * 0.5) / skills.length) * 100
  );

  return {
    demonstratedCount: dem,
    supportedCount: sup,
    transferableCount: trf,
    gapCount: gap,
    unknownCount: unk,
    totalSkills: skills.length,
    readinessScore: score,
  };
}
