import { describe, it, expect } from 'vitest';
import { parseResumeText } from '../src/lib/career/resume-parser';
import { calculateSkillGapMap } from '../src/lib/career/skill-gap-engine';
import { generateWeeklyPlan, generatePortfolioSuggestions } from '../src/lib/career/plan-generator';
import { processLearningEvent, clearProcessedEventsCache } from '../src/lib/career/learning-event-consumer';
import {
  generateInterviewSession,
  evaluateInterviewResponse,
  summarizeInterviewSession,
} from '../src/lib/career/interview-engine';
import { computeFunnelMetrics, type ApplicationRecord } from '../src/lib/career/application-service';
import { generatePlanAdaptationProposal } from '../src/lib/career/adaptation-engine';
import {
  determinePrimaryNextAction,
  computeWeeklyProgress,
  computeSkillReadinessBreakdown,
} from '../src/lib/career/dashboard-service';
import type { LearningEvent } from '../src/lib/contracts/events';

describe('Task 12: End-to-End Complete Part A Lifecycle Flow', () => {
  const userId = '00000000-0000-0000-0000-000000000001';

  it('runs complete Part A user journey seamlessly from resume intake to application adaptation', async () => {
    clearProcessedEventsCache();

    // 1. Intake: Resume Parsing
    const resumeText = `
Tharun Teja - Data Enthusiast

Experience:
Data Analyst at TechCorp
- Executed complex SQL data extraction queries and built star schema data models.
- Built interactive Tableau and Looker dashboards for operational KPI tracking.
- Analyzed datasets with Python scripts (Pandas) and automated daily reporting.
    `;
    const parsed = parseResumeText(resumeText);
    expect(parsed.summary.length).toBeGreaterThan(0);
    expect(parsed.claims.length).toBeGreaterThanOrEqual(3);

    const sqlClaim = parsed.claims.find((c) => c.skill_id === 'sql');
    expect(sqlClaim).toBeDefined();
    expect(sqlClaim?.verified_at).toBeNull(); // Human-in-the-loop guardrail verified

    // User confirms claim -> state: 'Supported'
    const confirmedEvidence = parsed.claims.map((c) => ({
      skill_id: c.skill_id,
      state: 'Supported' as const,
      confidence: c.confidence,
      excerpt: c.excerpt,
    }));

    // 2. Target Role & Sourced Skill Gap Map
    const roleRequirements = [
      { skill_id: 'sql', canonical_name: 'SQL (Structured Query Language)', importance: 1.0, source_ref: 'Core requirement' },
      { skill_id: 'data-modeling', canonical_name: 'Data Modeling', importance: 0.9, source_ref: 'Schema design' },
      { skill_id: 'cloud-warehouses', canonical_name: 'Cloud Warehouses', importance: 0.8, source_ref: 'Cloud platform' },
      { skill_id: 'communication', canonical_name: 'Executive Communication', importance: 0.7, source_ref: 'Stakeholders' },
    ];

    const gapMap = calculateSkillGapMap(roleRequirements, confirmedEvidence);
    expect(gapMap.length).toBe(4);
    const cloudGap = gapMap.find((g) => g.skill_id === 'cloud-warehouses');
    expect(cloudGap?.state).toBe('Gap');

    // 3. Personalized Weekly Plan Generation
    const weeklyBudgetMinutes = 180;
    const plan = generateWeeklyPlan('role-junior-analyst', gapMap, weeklyBudgetMinutes, 4);

    expect(plan.horizon_weeks).toBe(4);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.status).toBe('draft');

    // 4. Tutor Event Ingestion (Part B Handoff)
    const tutorEvent: LearningEvent = {
      event_id: 'e2e-event-1111-1111-1111-111111111111',
      event_type: 'lesson.completed',
      schema_version: 1,
      user_id: userId,
      aggregate_id: 'sql_course_1',
      occurred_at: new Date().toISOString(),
      idempotency_key: 'e2e_idem_key_1',
      payload: {
        lesson_id: 'sql-joins-v1',
        lesson_version: 1,
        skill_ids: ['sql'],
        score: 1.0,
        evidence_type: 'assessment',
      },
    };

    const eventResult = await processLearningEvent(tutorEvent);
    expect(eventResult.accepted).toBe(true);
    expect(eventResult.duplicate).toBe(false);
    expect(eventResult.affected_skills).toContain('sql');

    // Network retry is idempotent
    const retryResult = await processLearningEvent(tutorEvent);
    expect(retryResult.duplicate).toBe(true);

    // 5. Portfolio Project Assignment
    const portfolioBriefs = generatePortfolioSuggestions(gapMap);
    expect(portfolioBriefs.length).toBeGreaterThan(0);
    expect(portfolioBriefs[0].rubric.criteria.length).toBeGreaterThan(0);

    // 6. Mock Interview Evaluation
    const session = generateInterviewSession('junior-data-analyst', ['sql', 'communication']);
    expect(session.questions).toHaveLength(5);

    const firstQ = session.questions[0];
    const candidateAnswer =
      'An INNER JOIN returns only the rows where there is an explicit match between both tables on the join predicate. In contrast, a LEFT JOIN preserves all records from the left table regardless of whether a matching record exists in the right table. For rows without matches in the right table, NULL values are populated for those columns. I typically use INNER JOIN when looking for strict relationships, such as orders that must have customer records, and LEFT JOIN when auditing or reporting on optional relations, such as customers who may not yet have placed an order.';
    const evaluation = evaluateInterviewResponse(firstQ, candidateAnswer);

    expect(evaluation.overall_score).toBeGreaterThanOrEqual(3);
    expect(evaluation.evidence_citations.length).toBeGreaterThan(0);
    expect(evaluation.feedback.next_practice_action).toBeDefined();

    const summary = summarizeInterviewSession(session.id, [evaluation]);
    expect(summary.average_score).toBeGreaterThan(0);

    // 7. Application Tracking & Adaptation
    const applications: ApplicationRecord[] = [
      { id: '1', user_id: userId, company: 'Stripe', role_title: 'Analyst', stage: 'applied', applied_at: '2026-10-01', response_date: null, outcome: null, notes: null },
      { id: '2', user_id: userId, company: 'Google', role_title: 'Analyst', stage: 'rejected', applied_at: '2026-10-01', response_date: '2026-10-06', outcome: 'rejected_resume', notes: null },
      { id: '3', user_id: userId, company: 'Meta', role_title: 'Analyst', stage: 'screening', applied_at: '2026-10-02', response_date: '2026-10-08', outcome: null, notes: null },
      { id: '4', user_id: userId, company: 'Amazon', role_title: 'Analyst', stage: 'rejected', applied_at: '2026-10-03', response_date: '2026-10-09', outcome: 'rejected_resume', notes: null },
      { id: '5', user_id: userId, company: 'Apple', role_title: 'Analyst', stage: 'applied', applied_at: '2026-10-04', response_date: null, outcome: null, notes: null },
      { id: '6', user_id: userId, company: 'Netflix', role_title: 'Analyst', stage: 'rejected', applied_at: '2026-10-05', response_date: '2026-10-10', outcome: 'rejected_resume', notes: null },
    ];

    const funnelSummary = computeFunnelMetrics(applications);
    expect(funnelSummary.sample_size).toBe(6);
    expect(funnelSummary.is_directional).toBe(false);

    const proposal = generatePlanAdaptationProposal(
      { id: 'active-plan', version: 1, items: plan.tasks },
      funnelSummary
    );
    expect(proposal.status).toBe('pending_user_approval');
    expect(proposal.auto_applied).toBe(false); // human in the loop
    expect(proposal.diff.additions.length).toBeGreaterThan(0);

    // 8. Unified Dashboard Aggregation
    const flatItems = plan.tasks.map((t) => ({
      id: t.id,
      week: t.week,
      title: t.title,
      lesson_id: t.lesson_id,
      status: (t.lesson_id === 'sql-joins-v1' ? 'completed' : 'pending') as 'completed' | 'pending',
      minutes: t.estimated_minutes,
    }));

    const nextAction = determinePrimaryNextAction(flatItems, 'Junior Data Analyst');
    expect(nextAction.title).toBeDefined();

    const progress = computeWeeklyProgress(flatItems, weeklyBudgetMinutes);
    expect(progress.plannedMinutes).toBeGreaterThan(0);

    const readiness = computeSkillReadinessBreakdown([
      { id: 'sql', state: 'Demonstrated' },
      { id: 'data-modeling', state: 'Supported' },
      { id: 'cloud-warehouses', state: 'Gap' },
    ]);
    expect(readiness.demonstratedCount).toBe(1);
    expect(readiness.gapCount).toBe(1);
  });
});
