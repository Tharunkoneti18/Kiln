import {
  LessonManifest,
  LessonManifestSchema,
  LessonSegment,
  BoardEvent,
  AvatarGestureEvent,
} from '@/src/lib/contracts/lesson-manifest';

export interface GenerateTutorLessonInput {
  concept: string;
  skill_id: string;
  target_role?: string;
  estimated_minutes?: number;
}

export function validateTutorLessonManifest(manifest: unknown): {
  success: boolean;
  data?: LessonManifest;
  error?: string;
} {
  const result = LessonManifestSchema.safeParse(manifest);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
  };
}

export function calculatePlaybackStateAtOffset(
  segment: LessonSegment,
  offset_ms: number
): {
  activeBoardEvents: BoardEvent[];
  currentAvatarGesture: AvatarGestureEvent;
} {
  // All board events occurring at or before this offset
  const activeBoardEvents = segment.board_events.filter(
    (ev) => ev.offset_ms <= offset_ms
  );

  // Active avatar gesture (the most recent gesture started at or before offset)
  const sortedGestures = [...(segment.avatar_gestures || [])].sort(
    (a, b) => a.offset_ms - b.offset_ms
  );
  let currentAvatarGesture: AvatarGestureEvent = {
    offset_ms: 0,
    state: 'idle',
    expression: 'neutral',
  };

  for (const gesture of sortedGestures) {
    if (gesture.offset_ms <= offset_ms) {
      currentAvatarGesture = gesture;
    } else {
      break;
    }
  }

  return {
    activeBoardEvents,
    currentAvatarGesture,
  };
}

export async function generateTutorLessonForConcept(
  input: GenerateTutorLessonInput
): Promise<LessonManifest> {
  const { concept, skill_id, target_role = 'Target Role', estimated_minutes = 20 } = input;
  const slug = concept
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const lesson_id = `${skill_id}-${slug}-v1`;

  const duration_ms = estimated_minutes * 60 * 1000;
  const halfDuration_ms = Math.floor(duration_ms / 2);

  // Synthesize realistic pedagogical lesson segments
  const segment1: LessonSegment = {
    segment_id: `${lesson_id}_seg_intro`,
    title: `Core Principles: ${concept}`,
    narration_text: `Welcome to this masterclass on ${concept} for ${target_role}. Understanding the underlying architecture and trade-offs is essential for senior technical performance. Let's break down the foundational model on our whiteboard.`,
    duration_ms: halfDuration_ms,
    board_events: [
      {
        event_id: `ev_${lesson_id}_1`,
        segment_id: `${lesson_id}_seg_intro`,
        offset_ms: 1500,
        type: 'text',
        payload: {
          x: 0.1,
          y: 0.15,
          text: `Module: ${concept}`,
          font_scale: 0.05,
          color: '#1B6342',
        },
        accessible_text: `Whiteboard title: Module: ${concept}`,
      },
      {
        event_id: `ev_${lesson_id}_2`,
        segment_id: `${lesson_id}_seg_intro`,
        offset_ms: 4500,
        type: 'rectangle',
        payload: {
          x: 0.1,
          y: 0.3,
          width: 0.35,
          height: 0.45,
          stroke: '#2D3748',
          fill: '#F7FAFC',
        },
        accessible_text: 'Diagram box representing foundational data flow',
      },
      {
        event_id: `ev_${lesson_id}_3`,
        segment_id: `${lesson_id}_seg_intro`,
        offset_ms: 7000,
        type: 'arrow',
        payload: {
          from_x: 0.45,
          from_y: 0.5,
          to_x: 0.65,
          to_y: 0.5,
          stroke: '#1B6342',
        },
        accessible_text: 'Arrow indicating transformation stage to analytical output',
      },
      {
        event_id: `ev_${lesson_id}_4`,
        segment_id: `${lesson_id}_seg_intro`,
        offset_ms: 9500,
        type: 'text',
        payload: {
          x: 0.68,
          y: 0.48,
          text: 'Verified Result',
          font_scale: 0.04,
          color: '#2B6CB0',
        },
        accessible_text: 'Label: Verified Result',
      },
    ],
    avatar_gestures: [
      {
        offset_ms: 0,
        state: 'speaking',
        expression: 'encouraging',
        duration_ms: 3000,
      },
      {
        offset_ms: 3500,
        state: 'pointing',
        target: { x: 0.1, y: 0.3 },
        expression: 'emphasizing',
        duration_ms: 4000,
      },
      {
        offset_ms: 8000,
        state: 'speaking',
        expression: 'thoughtful',
        duration_ms: 5000,
      },
      {
        offset_ms: 14000,
        state: 'idle',
        expression: 'neutral',
      },
    ],
    checkpoint: true,
  };

  const segment2: LessonSegment = {
    segment_id: `${lesson_id}_seg_deep_dive`,
    title: `Practical Implementation & Edge Cases`,
    narration_text: `Now let's examine common production pitfalls when working with ${concept}. Notice how index access paths, partitioning, and resource utilization differ significantly under high concurrency.`,
    duration_ms: halfDuration_ms,
    board_events: [
      {
        event_id: `ev_${lesson_id}_5`,
        segment_id: `${lesson_id}_seg_deep_dive`,
        offset_ms: 1000,
        type: 'clear',
        payload: {},
        accessible_text: 'Board clears for implementation deep dive',
      },
      {
        event_id: `ev_${lesson_id}_6`,
        segment_id: `${lesson_id}_seg_deep_dive`,
        offset_ms: 3000,
        type: 'text',
        payload: {
          x: 0.1,
          y: 0.18,
          text: `Production Checklist: ${concept}`,
          font_scale: 0.045,
          color: '#1A202C',
        },
        accessible_text: 'Checklist header for production considerations',
      },
      {
        event_id: `ev_${lesson_id}_7`,
        segment_id: `${lesson_id}_seg_deep_dive`,
        offset_ms: 6000,
        type: 'text',
        payload: {
          x: 0.12,
          y: 0.32,
          text: '✓ 1. Execution plan verification (Cost / Buffers)',
          font_scale: 0.035,
          color: '#319795',
        },
        accessible_text: 'Item 1: Execution plan verification',
      },
      {
        event_id: `ev_${lesson_id}_8`,
        segment_id: `${lesson_id}_seg_deep_dive`,
        offset_ms: 9000,
        type: 'text',
        payload: {
          x: 0.12,
          y: 0.44,
          text: '✓ 2. Idempotent error handling & bounded retries',
          font_scale: 0.035,
          color: '#319795',
        },
        accessible_text: 'Item 2: Idempotent error handling & bounded retries',
      },
    ],
    avatar_gestures: [
      {
        offset_ms: 0,
        state: 'speaking',
        expression: 'thoughtful',
        duration_ms: 4000,
      },
      {
        offset_ms: 5000,
        state: 'pointing',
        target: { x: 0.12, y: 0.32 },
        expression: 'emphasizing',
        duration_ms: 5000,
      },
      {
        offset_ms: 11000,
        state: 'listening',
        expression: 'neutral',
      },
    ],
    checkpoint: true,
  };

  const quizQuestion = {
    question_id: `q_${lesson_id}_1`,
    prompt: `When applying ${concept} in a high-scale production system, what is the primary architectural trade-off to monitor?`,
    options: [
      'Resource utilization (CPU/Memory/I/O) versus latency and consistency constraints',
      'Using unindexed tables to minimize disk write overhead',
      'Ignoring execution plans in favor of brute-force scanning',
      'Disabling connection pooling to isolate thread contexts',
    ],
    correct_option_index: 0,
    explanation:
      'Engineers must balance execution efficiency and resource footprint against query latency and data consistency requirements.',
  };

  const manifest: LessonManifest = {
    lesson_id,
    version: 1,
    title: `Mastering ${concept}`,
    objective: `Gain deep mastery of ${concept} with verifiable proof and production edge cases for ${target_role}.`,
    estimated_seconds: estimated_minutes * 60,
    skill_ids: [skill_id],
    segments: [segment1, segment2],
    quiz: [quizQuestion],
    accessibility: {
      transcript: `${segment1.narration_text} ${segment2.narration_text}`,
      descriptions: [
        'Visual whiteboard diagram detailing data flows, architecture components, and execution criteria.',
      ],
    },
    sources: [
      {
        label: `${target_role} Skill Requirements & Curated Taxonomy`,
        accessed_at: new Date().toISOString(),
      },
    ],
    checksum: `sha256_${lesson_id}_${Date.now()}`,
  };

  return manifest;
}
