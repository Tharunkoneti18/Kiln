import { describe, it, expect } from 'vitest';
import { generateWeeklyPlan, generatePortfolioSuggestions } from '../src/lib/career/plan-generator';
import type { SkillGapItem } from '../src/lib/career/skill-gap-engine';

describe('Personalized Weekly Plan Generator & Portfolio Engine', () => {
  const sampleGaps: SkillGapItem[] = [
    {
      skill_id: 'sql',
      canonical_name: 'SQL (Structured Query Language)',
      importance: 1.0,
      state: 'Gap',
      confidence: 0.1,
      priority_score: 100,
      provenance: 'Core requirement',
    },
    {
      skill_id: 'data-modeling',
      canonical_name: 'Data Modeling',
      importance: 0.9,
      state: 'Gap',
      confidence: 0.1,
      priority_score: 90,
      provenance: 'Relational design',
    },
    {
      skill_id: 'data-visualization',
      canonical_name: 'Data Visualization',
      importance: 0.8,
      state: 'Supported',
      confidence: 0.7,
      priority_score: 20,
      provenance: 'Profile claims',
    },
  ];

  it('generates a 4-week structured plan respecting weekly time budget', () => {
    const weeklyMinutes = 180; // 3 hours
    const plan = generateWeeklyPlan('role_jda_001', sampleGaps, weeklyMinutes, 4);

    expect(plan.horizon_weeks).toBe(4);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.version).toBe(1);
    expect(plan.status).toBe('draft');

    // Group by week
    const weeksMap = new Map<number, number>();
    for (const task of plan.tasks) {
      const current = weeksMap.get(task.week) || 0;
      weeksMap.set(task.week, current + 1);
    }

    // Must not exceed 3 primary tasks per week
    for (const count of weeksMap.values()) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  it('links relevant plan items to Part B Tutor lesson IDs', () => {
    const plan = generateWeeklyPlan('role_jda_001', sampleGaps, 240, 4);

    const sqlTask = plan.tasks.find(t => t.skill_ids.includes('sql'));
    expect(sqlTask).toBeDefined();
    expect(sqlTask?.lesson_id).toBe('sql-joins-v1');
    expect(sqlTask?.completion_criteria.length).toBeGreaterThan(0);
  });

  it('generates 1-3 portfolio project suggestions for priority gaps', () => {
    const projects = generatePortfolioSuggestions(sampleGaps);
    expect(projects.length).toBeGreaterThanOrEqual(1);
    expect(projects.length).toBeLessThanOrEqual(3);

    const topProject = projects[0];
    expect(topProject.title).toBeDefined();
    expect(topProject.brief).toBeDefined();
    expect(topProject.estimated_hours).toBeGreaterThan(0);
    expect(topProject.rubric).toBeDefined();
    expect(topProject.target_skill_ids).toContain('sql');
  });
});
