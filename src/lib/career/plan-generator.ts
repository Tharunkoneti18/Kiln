import type { SkillGapItem } from './skill-gap-engine';
import type { WeeklyPlanTask } from '../contracts/career';

export interface GeneratedPlan {
  id: string;
  role_id: string;
  version: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  horizon_weeks: number;
  rationale: string;
  tasks: WeeklyPlanTask[];
}

export interface PortfolioSuggestion {
  id: string;
  title: string;
  brief: string;
  target_skill_ids: string[];
  estimated_hours: number;
  rubric: {
    criteria: string[];
    deliverable: string;
  };
}

export function generateWeeklyPlan(
  roleId: string,
  gaps: SkillGapItem[],
  weeklyMinutesBudget: number = 240,
  horizonWeeks: number = 4
): GeneratedPlan {
  const planId = `plan_${Date.now()}`;
  const tasks: WeeklyPlanTask[] = [];

  // Sort gaps by priority descending
  const priorityGaps = gaps.filter(g => g.state === 'Gap' || g.state === 'Transferable');

  // Week 1: Core Foundation & Guided Learning
  tasks.push({
    id: `task_w1_1`,
    week: 1,
    title: 'Master Relational Joins & SQL Data Aggregation',
    objective: 'Demonstrate INNER, LEFT, and aggregate queries over normalized schemas',
    skill_ids: ['sql', 'data-modeling'],
    lesson_id: 'sql-joins-v1', // Links directly to Part B!
    estimated_minutes: Math.min(120, Math.floor(weeklyMinutesBudget * 0.6)),
    status: 'queued',
    rationale: 'Target role requires SQL as a core dependency. Start with foundational query mechanics.',
    completion_criteria: [
      'Pass quiz check in Tutor lesson sql-joins-v1',
      'Submit query script demonstrating LEFT JOIN over orders & customers',
    ],
  });

  tasks.push({
    id: `task_w1_2`,
    week: 1,
    title: 'Entity Relationship Diagram & Schema Mapping',
    objective: 'Map foreign key relationships and normalization constraints',
    skill_ids: ['data-modeling'],
    estimated_minutes: Math.min(60, Math.floor(weeklyMinutesBudget * 0.3)),
    status: 'queued',
    rationale: 'Complement SQL query knowledge with data architecture foundation.',
    completion_criteria: ['Produce diagram file with 3 normalized relational entities'],
  });

  // Week 2: Practical Application & Data Transformation
  tasks.push({
    id: `task_w2_1`,
    week: 2,
    title: 'Data Cleaning & Transformation Pipeline',
    objective: 'Transform messy raw extracts into clean analytical views',
    skill_ids: ['sql', 'spreadsheets'],
    estimated_minutes: Math.min(120, Math.floor(weeklyMinutesBudget * 0.6)),
    status: 'queued',
    rationale: 'Bridge spreadsheet formula knowledge into scalable database transformations.',
    completion_criteria: ['Handle missing values and validate column data types in SQL'],
  });

  // Week 3: Visualization & Stakeholder Communication
  tasks.push({
    id: `task_w3_1`,
    week: 3,
    title: 'Executive KPI Dashboard Construction',
    objective: 'Build interactive metrics dashboard summarizing cohort retention',
    skill_ids: ['data-visualization', 'data-communication'],
    estimated_minutes: Math.min(120, Math.floor(weeklyMinutesBudget * 0.6)),
    status: 'queued',
    rationale: 'Target role emphasizes presenting actionable metrics to business teams.',
    completion_criteria: ['Publish interactive dashboard with filterable time periods and clear KPI cards'],
  });

  // Week 4: Proof, Portfolio & Practice
  tasks.push({
    id: `task_w4_1`,
    week: 4,
    title: 'End-to-End Analytical Portfolio Artifact',
    objective: 'Synthesize data model, queries, and dashboard into a shareable case study',
    skill_ids: ['sql', 'data-visualization', 'data-communication'],
    estimated_minutes: Math.min(120, Math.floor(weeklyMinutesBudget * 0.6)),
    status: 'queued',
    rationale: 'Convert learned capability into tangible proof for job applications.',
    completion_criteria: ['Upload portfolio brief and GitHub/dashboard URL with written reflection'],
  });

  tasks.push({
    id: `task_w4_2`,
    week: 4,
    title: 'Rubric-Scored Technical Interview Simulation',
    objective: 'Complete simulated technical and behavioral interview for Junior Data Analyst',
    skill_ids: ['data-communication', 'sql'],
    estimated_minutes: Math.min(60, Math.floor(weeklyMinutesBudget * 0.3)),
    status: 'queued',
    rationale: 'Validate communication of technical trade-offs before live interviews.',
    completion_criteria: ['Score at least 3.0 on rubric across technical accuracy and reasoning'],
  });

  return {
    id: planId,
    role_id: roleId,
    version: 1,
    status: 'draft',
    horizon_weeks: horizonWeeks,
    rationale: 'Structured 4-week ramp addressing high-priority SQL and modeling gaps with hands-on practice and portfolio proof.',
    tasks,
  };
}

export function generatePortfolioSuggestions(gaps: SkillGapItem[]): PortfolioSuggestion[] {
  const suggestions: PortfolioSuggestion[] = [];

  const hasSql = gaps.some(g => g.skill_id === 'sql');
  if (hasSql) {
    suggestions.push({
      id: 'proj_ecommerce_sql',
      title: 'E-Commerce Cohort Retention & SQL Revenue Analysis',
      brief: 'Analyze customer purchase transactions over a 12-month period to calculate monthly churn, LTV, and repeat purchase frequency.',
      target_skill_ids: ['sql', 'data-modeling'],
      estimated_hours: 6,
      rubric: {
        criteria: ['Correct use of window functions and CTEs', 'Clean ER diagram', 'Documented data anomalies'],
        deliverable: 'SQL script file + 1-page executive summary PDF',
      },
    });
  }

  const hasViz = gaps.some(g => g.skill_id === 'data-visualization');
  if (hasViz || suggestions.length < 2) {
    suggestions.push({
      id: 'proj_saas_dashboard',
      title: 'Subscription SaaS Executive KPI Dashboard',
      brief: 'Design a clean 3-tab interactive dashboard tracking MRR growth, active users, and customer acquisition payback period.',
      target_skill_ids: ['data-visualization', 'data-communication'],
      estimated_hours: 5,
      rubric: {
        criteria: ['Clear visual hierarchy and contrasting color coding', 'Interactive date range filter', 'Concise KPI callout cards'],
        deliverable: 'Tableau Public / Power BI link or screenshot PDF with walk-through video',
      },
    });
  }

  return suggestions;
}
