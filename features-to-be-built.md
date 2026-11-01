# Features to be Built: Part A — Supabase Platform & Career Intelligence

Source of Truth: `docs-foragnet/Career_OS_PRD_and_Build_Blueprint.md` and `docs-foragnet/role&work`

---

## 1. Supabase Platform Foundation & Identity
- **Supabase Local & Cloud Setup**: Project ref `nvqfhmwchybhvdfwrqbs`.
- **Database Schema**: Full DDL for:
  - `profiles` (`id references auth.users`, `region`, `language`, `weekly_minutes`, `accessibility_prefs`)
  - `career_profiles` (`id`, `user_id`, `version`, `summary`, `source_status`)
  - `profile_evidence` (`id`, `user_id`, `source_file_id`, `kind`, `excerpt`, `confidence`, `verified_at`, `source_locator`)
  - `target_roles` (`id`, `user_id`, `title`, `region`, `level`, `jd_text`, `source_uri`, `source_date`, `version`)
  - `skills` & `role_skills` (canonical name, taxonomy, importance, source reference)
  - `user_skill_evidence` (`user_id`, `skill_id`, `evidence_ids`, `state`, `level`, `confidence`, `assessed_at`)
  - `learning_plans` & `plan_items` (`user_id`, `role_id`, `version`, `status`, `rationale`, `approved_at`, `plan_items`: `week`, `minutes`, `skill_ids`, `lesson_id`, `status`, `completion_criteria`)
  - `lessons` & `lesson_progress` (curated lesson metadata and checkpointing for Part B)
  - `learning_events` (`event_id`, `user_id`, `event_type`, `schema_version`, `aggregate_id`, `occurred_at`, `idempotency_key`, `payload`)
  - `portfolio_artifacts` (`id`, `user_id`, `title`, `uri`, `skill_ids`, `rubric`, `visibility`, `verified_state`)
  - `interview_sessions` (`id`, `user_id`, `role_id`, `rubric_version`, `status`, `score_summary`, `responses`)
  - `applications` (`id`, `user_id`, `company`, `role_snapshot`, `stage`, `applied_at`, `response_date`, `outcome`, `notes`)
  - `outcome_summaries` (`id`, `user_id`, `window`, `sample_size`, `metrics`, `caveats`, `proposed_actions`)
- **Row Level Security (RLS)**: Enforced on all user tables with `(select auth.uid()) = user_id`. Operation-specific policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- **Explicit Grants**: Explicit table grants per October 30, 2026 Supabase Data API security rules.
- **Storage Buckets & Policies**: Private buckets `resumes`, `portfolio_evidence`, and `lesson_assets` scoped to `<user_id>/*` path policies.
- **Generated Types**: `src/types/database.generated.ts` matching schema.
- **Shared Contracts (Unblocks Part B)**:
  - Event envelope schema `{event_id, event_type, schema_version, user_id, aggregate_id, occurred_at, idempotency_key, payload}`.
  - Lesson manifest schema `{lesson_id, version, title, objective, segments: [...], quiz: [...]}`.
  - Seed fixtures in `content/lessons/` and `content/roles/`.

---

## 2. Resume / Profile Intake & Review
- Deterministic text extraction from PDF and DOCX documents with page/paragraph source locators.
- Structured extraction into skill claims with confidence ratings.
- Human-in-the-loop preview & confirmation: no unreviewed claims or automatic `Demonstrated` status without user review.
- Storage of uploaded files in private `resumes` bucket with short-lived signed URLs.

---

## 3. Target-Role Intake & Sourced Skill-Gap Map
- Role selection from curated library or user-pasted job description.
- Extraction of role requirements with source citations and importance levels.
- Normalized skill comparison against user evidence:
  - `Demonstrated`: verified work sample or assessment evidence.
  - `Supported`: profile claim without direct proof.
  - `Transferable`: adjacent capability with stated bridge and uncertainty explanation.
  - `Gap`: required capability without evidence.
  - `Unknown`: insufficient/conflicting data (never silently classified as gap).
- Priority score calculation: $P = \text{importance} \times \text{gap magnitude} \times \text{confidence}$.

---

## 4. Personalized Weekly Plans & Portfolio Projects
- 4-week default plan respecting user's weekly time budget (default 3–5 hours/week).
- Max 3 primary tasks per week with time estimates, rationale, skill links, and completion definitions.
- Tasks link to Part B `lesson_id` where applicable (`/tutor?lessonId=...`).
- Plan versions are immutable; user approval requires explicit version check (rejecting stale drafts with 409).
- Scoped portfolio project suggestions (1–3 per priority gap) with rubric, constraints, and time estimates.

---

## 5. Tutor Event Ingestion & Skill Progress Handoff
- Inbound endpoint `POST /api/v1/learning-events` receiving Part B events (`lesson.completed`, `lesson.check_submitted`).
- Strict idempotency: deduplication by `event_id` and `(user_id, idempotency_key)`.
- Automatically transitions linked `plan_item.status` to `completed` and updates `user_skill_evidence` to `Demonstrated` with evidence type `assessment`.

---

## 6. Mock Interviews & Rubric Feedback
- 5 role-specific interview questions linked to target skills.
- Typed answer interface.
- 1–4 anchored rubric scoring across framing, technical accuracy, reasoning, trade-offs, and communication.
- Feedback citing specific answer evidence, separating content from delivery, and providing one concrete practice action.

---

## 7. Application Tracking, Outcome Summaries & Adaptation Proposals
- Manual tracking of job applications: company, role, stage, dates, outcome, notes.
- Funnel metrics calculation with sample-size guardrail ($n \ge 5$ required before statistical comparisons; smaller samples flagged directional).
- Adaptation proposal engine: generates explicit diff of proposed plan changes with rationale when learning or application milestones are reached.
- Requires explicit user approval before applying changes to the active plan.

---

## 8. Career Dashboard & Navigation Shell
- Responsive, modern navigation shell.
- Unified dashboard showing:
  - Primary next action (e.g. "Continue SQL Joins Lesson in Tutor").
  - Weekly plan progress bar and hours spent vs budget.
  - Skill readiness summary (Demonstrated vs Gaps).
  - Quick access to Map, Plan, Portfolio, Practice, Applications, and Tutor.
