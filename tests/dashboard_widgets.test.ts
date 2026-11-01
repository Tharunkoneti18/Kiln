import { describe, it, expect } from 'vitest';
import {
  determinePrimaryNextAction,
  computeWeeklyProgress,
  computeSkillReadinessBreakdown,
  type DashboardPlanItem,
  type DashboardSkill,
} from '../src/lib/career/dashboard-service';

describe('Task 11: Unified Career Dashboard & Shell Navigation', () => {
  const sampleItems: DashboardPlanItem[] = [
    {
      id: 'item-1',
      week: 1,
      title: 'SQL Joins Mastery',
      lesson_id: 'sql-joins-v1',
      status: 'completed',
      minutes: 60,
    },
    {
      id: 'item-2',
      week: 1,
      title: 'Data Modeling Grain Analysis',
      lesson_id: 'data-modeling-v1',
      status: 'pending',
      minutes: 90,
    },
    {
      id: 'item-3',
      week: 2,
      title: 'Executive Dashboard Layout',
      status: 'pending',
      minutes: 60,
    },
  ];

  it('determines the primary next action pointing to the Tutor lesson for pending plan items', () => {
    const nextAction = determinePrimaryNextAction(sampleItems, 'Junior Data Analyst');

    expect(nextAction.title).toBe('Data Modeling Grain Analysis');
    expect(nextAction.type).toBe('tutor_lesson');
    expect(nextAction.action_url).toBe('/tutor?lessonId=data-modeling-v1');
    expect(nextAction.estimated_minutes).toBe(90);
  });

  it('computes weekly progress against user weekly time budget accurately', () => {
    const progress = computeWeeklyProgress(sampleItems, 180);

    expect(progress.completedMinutes).toBe(60);
    expect(progress.plannedMinutes).toBe(210);
    expect(progress.budgetMinutes).toBe(180);
    expect(progress.completionPercentage).toBe(29); // 60/210 ≈ 28.57% -> 29%
  });

  it('computes skill readiness breakdown and weighted readiness score', () => {
    const skills: DashboardSkill[] = [
      { id: 'sql', state: 'Demonstrated' },
      { id: 'data-modeling', state: 'Supported' },
      { id: 'python', state: 'Transferable' },
      { id: 'cloud-warehouses', state: 'Gap' },
    ];

    const breakdown = computeSkillReadinessBreakdown(skills);

    expect(breakdown.demonstratedCount).toBe(1);
    expect(breakdown.gapCount).toBe(1);
    expect(breakdown.totalSkills).toBe(4);
    // (1.0 + 0.7 + 0.5 + 0) / 4 = 2.2 / 4 = 55%
    expect(breakdown.readinessScore).toBe(55);
  });
});
