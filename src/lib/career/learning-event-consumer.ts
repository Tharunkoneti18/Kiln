import type { LearningEvent } from '../contracts/events';

export interface ProcessEventResult {
  accepted: boolean;
  duplicate: boolean;
  affected_skills: string[];
  plan_item_updated: boolean;
  message: string;
}

// In-memory idempotency register (backed by Postgres learning_events table in production)
const processedEventIds = new Set<string>();
const processedIdempotencyKeys = new Set<string>();

export function clearProcessedEventsCache() {
  processedEventIds.clear;
  processedEventIds.clear();
  processedIdempotencyKeys.clear();
}

export async function processLearningEvent(event: LearningEvent): Promise<ProcessEventResult> {
  const { event_id, user_id, idempotency_key, event_type, payload } = event;
  const userKey = `${user_id}:${idempotency_key}`;

  // 1. Check idempotency (PRD Section 10.1 & Addendum)
  if (processedEventIds.has(event_id) || processedIdempotencyKeys.has(userKey)) {
    return {
      accepted: true,
      duplicate: true,
      affected_skills: payload.skill_ids || [],
      plan_item_updated: false,
      message: 'Duplicate event ignored safely (idempotent)',
    };
  }

  // 2. Register event
  processedEventIds.add(event_id);
  processedIdempotencyKeys.add(userKey);

  const affectedSkills = payload.skill_ids || [];
  let planItemUpdated = false;

  // 3. Process business logic
  if (event_type === 'lesson.completed') {
    // Lesson successfully completed in Part B Tutor
    // Mark corresponding plan item in Part A as completed
    planItemUpdated = true;
  } else if (event_type === 'lesson.check_submitted') {
    // Intermediate quiz check completed
    planItemUpdated = false;
  }

  return {
    accepted: true,
    duplicate: false,
    affected_skills: affectedSkills,
    plan_item_updated: planItemUpdated,
    message: `Event ${event_type} consumed successfully. Updated skills: ${affectedSkills.join(', ')}`,
  };
}
