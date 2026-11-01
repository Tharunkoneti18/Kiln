import { describe, it, expect } from 'vitest';
import {
  generateInterviewSession,
  evaluateInterviewResponse,
  summarizeInterviewSession,
  type InterviewQuestion,
  type InterviewResponseEvaluation,
} from '../src/lib/career/interview-engine';

describe('Task 9: Mock Interview Rubric Engine & Feedback Scorer', () => {
  const sampleRoleId = 'junior-data-analyst';
  const sampleSkills = ['sql', 'data-modeling', 'data-visualization', 'communication'];

  it('generates 5 role-linked interview questions with 1-4 anchored rubrics', () => {
    const session = generateInterviewSession(sampleRoleId, sampleSkills);

    expect(session.role_id).toBe(sampleRoleId);
    expect(session.questions).toHaveLength(5);

    session.questions.forEach((q, idx) => {
      expect(q.id).toBeDefined();
      expect(q.text.length).toBeGreaterThan(15);
      expect(q.target_skills.length).toBeGreaterThan(0);
      expect(q.rubric).toBeDefined();
      expect(q.rubric.dimensions).toHaveLength(5); // framing, technical accuracy, reasoning, trade-offs, communication
      expect(q.rubric.levels['1']).toBeDefined();
      expect(q.rubric.levels['4']).toBeDefined();
    });
  });

  it('evaluates candidate response, generating 1-4 anchored scores with direct citations and concrete next action', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      text: 'Explain when you would use an INNER JOIN versus a LEFT JOIN in SQL and what happens to non-matching rows.',
      target_skills: ['sql'],
      rubric: {
        dimensions: ['framing', 'technical_accuracy', 'reasoning', 'trade_offs', 'communication'],
        levels: {
          '1': 'Incorrect or vague definitions; confused about join behavior.',
          '2': 'Understands match mechanics but fails to explain null handling or real-world use cases.',
          '3': 'Clear technical distinction, explains null preservation in LEFT JOIN and filter behavior in INNER JOIN.',
          '4': 'Exemplary clarity, covers performance implications, NULL handling in WHERE clauses, and edge cases.',
        },
      },
    };

    const goodAnswer =
      'An INNER JOIN returns only the rows where there is an explicit match between both tables on the join predicate. In contrast, a LEFT JOIN preserves all records from the left table regardless of whether a matching record exists in the right table. For rows without matches in the right table, NULL values are populated for those columns. I typically use INNER JOIN when looking for strict relationships, such as orders that must have customer records, and LEFT JOIN when auditing or reporting on optional relations, such as customers who may not yet have placed an order.';

    const evaluation: InterviewResponseEvaluation = evaluateInterviewResponse(question, goodAnswer);

    expect(evaluation.question_id).toBe('q1');
    expect(evaluation.overall_score).toBeGreaterThanOrEqual(3);
    expect(evaluation.overall_score).toBeLessThanOrEqual(4);

    // Dimension breakdown
    expect(evaluation.dimension_scores.technical_accuracy).toBeGreaterThanOrEqual(3);
    expect(evaluation.dimension_scores.framing).toBeGreaterThanOrEqual(3);

    // Citations extracted directly from answer
    expect(evaluation.evidence_citations.length).toBeGreaterThan(0);
    evaluation.evidence_citations.forEach((citation) => {
      expect(goodAnswer).toContain(citation);
    });

    // Content vs delivery feedback
    expect(evaluation.feedback.content_strengths.length).toBeGreaterThan(0);
    expect(evaluation.feedback.next_practice_action).toBeDefined();
    expect(typeof evaluation.feedback.next_practice_action).toBe('string');
  });

  it('evaluates weak/brief answers objectively with score 1-2, constructive citations, and actionable drill', () => {
    const question: InterviewQuestion = {
      id: 'q2',
      text: 'How do you structure an executive dashboard to avoid cognitive overload?',
      target_skills: ['data-visualization', 'communication'],
      rubric: {
        dimensions: ['framing', 'technical_accuracy', 'reasoning', 'trade_offs', 'communication'],
        levels: {
          '1': 'Lacks clear layout hierarchy or metric selection framework.',
          '2': 'Mentions keeping it clean but lacks structured methodology.',
          '3': 'Applies progressive disclosure, KPI top-line cards, and actionable drill-downs.',
          '4': 'Comprehensive framework: inverted pyramid, audience persona mapping, cognitive load principles.',
        },
      },
    };

    const briefAnswer = 'I just put lots of charts and make them colorful so it looks nice.';
    const evaluation = evaluateInterviewResponse(question, briefAnswer);

    expect(evaluation.overall_score).toBeLessThanOrEqual(2);
    expect(evaluation.dimension_scores.framing).toBeLessThanOrEqual(2);
    expect(evaluation.evidence_citations).toContain('make them colorful');
    expect(evaluation.feedback.areas_for_growth.length).toBeGreaterThan(0);
    expect(evaluation.feedback.next_practice_action).toContain('dashboard');
  });

  it('summarizes an interview session across all questions without demographic inferences', () => {
    const session = generateInterviewSession(sampleRoleId, sampleSkills);
    const mockEvaluations: InterviewResponseEvaluation[] = session.questions.map((q) => ({
      question_id: q.id,
      overall_score: 3.5,
      dimension_scores: {
        framing: 3,
        technical_accuracy: 4,
        reasoning: 3,
        trade_offs: 3,
        communication: 4,
      },
      evidence_citations: ['sample citation'],
      feedback: {
        content_strengths: ['Clear terminology'],
        areas_for_growth: ['Provide deeper edge-case analysis'],
        next_practice_action: 'Practice trade-off explanations with high-concurrency systems',
      },
    }));

    const summary = summarizeInterviewSession(session.id, mockEvaluations);
    expect(summary.average_score).toBe(3.5);
    expect(summary.readiness_verdict).toBe('Interview Ready');
    expect(summary.priority_actions.length).toBeGreaterThan(0);
  });
});
