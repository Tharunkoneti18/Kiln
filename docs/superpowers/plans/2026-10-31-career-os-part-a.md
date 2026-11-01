# Career OS: Part A — Supabase Platform & Career Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Part A foundation for Career OS, including Supabase database schema, RLS policies, Storage buckets, Auth integration, generated TypeScript types, shared event contracts, profile/resume review, target-role intake, sourced skill-gap mapping, weekly plan generation, portfolio tracking, rubric mock interviews, application tracking, adaptive proposals, dashboard, and idempotent consumption of Part B Tutor learning events.

**Architecture:** Next.js (App Router) + TypeScript modular monolith backed by Supabase Postgres, Supabase Auth, and Supabase Storage. Row Level Security (RLS) and explicit table grants enforce strict user tenant isolation (`auth.uid() = user_id`). Shared TypeScript & Zod contracts decouple Part A (Career Intelligence) from Part B (Tutor & Learning Runtime), communicating via versioned event envelopes (`learning_events`) and immutable lesson manifests.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@supabase/supabase-js`, `@supabase/ssr`, Zod, Vitest (for unit & contract test suite), Supabase CLI (Postgres, RLS, Storage, migrations).

**Spec:** [docs-foragnet/Career_OS_PRD_and_Build_Blueprint.md](file:///c:/Users/Tharun%20Teja/pr/docs-foragnet/Career_OS_PRD_and_Build_Blueprint.md)

---

## Global Constraints

- RLS enabled on every public table in Postgres; never rely on `TO authenticated` alone; explicit owner checks `(select auth.uid()) = user_id`.
- `UPDATE` policies must provide matching `SELECT`, `USING`, and `WITH CHECK` conditions; users cannot reassign row ownership (`user_id`).
- Explicit SQL `GRANT` review on all tables; Data API defaults from October 30, 2026 require explicit grants to `authenticated` and `anon`.
- Service-role / secret keys (`SUPABASE_SECRET_KEY`) strictly forbidden in client-side code or `NEXT_PUBLIC_*` variables.
- Storage buckets (`resumes`, `portfolio_evidence`, `lesson_assets`) are private; folder path must match `<user_id>/...` and enforce object-level RLS.
- Tutor event consumption (`learning_events`) must be idempotent; duplicates by `event_id` or `(user_id, idempotency_key)` are safely ignored without double-crediting.
- AI & analytical recommendations must be inspectable: require source provenance, confidence ratings, and explicit human review before committing profile or plan changes.
- Directional insights on job applications require sample size $n \ge 5$ to prevent false conclusions from sparse data.
- Boundary protection: Do NOT build the Tutor whiteboard renderer, 3D avatar, or audio player (strictly owned by Part B).

## Review Focus

1. **Unauthenticated / Cross-Tenant Data Access:** User B maliciously requests or mutates User A's profile, target role, plan, evidence, or storage objects via Supabase client. System must reject with 403 / empty result set via RLS.
2. **Duplicate Learning Event Emission:** Network retry sends identical `lesson.completed` or `lesson.check_submitted` events. Idempotent event consumer must process it once without duplicating progress or double-completing tasks.
3. **Plan Version Concurrency & Tampering:** User approves an outdated plan version or attempts to change someone else's plan. System rejects with 409 Conflict.
4. **Sparse Application Data Overconfidence:** User logs 1-2 job applications and views outcome analytics. System must flag the sample as directional and suppress statistical causality claims until $n \ge 5$.
5. **Resume & Evidence Extraction Hallucination:** Extraction parser returns ungrounded skill claims without text locators. Engine must label evidence as `Unknown` or unverified rather than silently promoting to `Demonstrated`.

---

## Task Decomposition

### Task 1: Project Scaffolding & Testing Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/lib/env.ts`
- Test: `tests/env.test.ts`

**Interfaces:**
- Produces: Type-safe environment variable validator `getEnv()`

- [ ] **Step 1: Write failing test for environment configuration**
  Create `tests/env.test.ts` verifying that `getEnv()` validates `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, throwing when invalid.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/env.test.ts` -> FAIL (missing files)
- [ ] **Step 3: Implement project scaffolding and `src/lib/env.ts`**
  Setup `package.json` with Next.js, React, Supabase, Zod, and Vitest. Implement `getEnv()` with Zod schema validation.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/env.test.ts` -> PASS
- [ ] **Step 5: Verify build scripts**
  Run `npm run build` or test compile to ensure zero configuration errors.

---

### Task 2: Supabase Migrations, Complete Schema, Grants & RLS Policies

**Files:**
- Create: `supabase/migrations/20261031000001_career_os_core_schema.sql`
- Create: `supabase/migrations/20261031000002_storage_and_grants.sql`
- Create: `supabase/seed.sql`
- Test: `tests/database_rls_contract.test.ts`

**Interfaces:**
- Consumes: Database schema from PRD Addendum Section C & 10.
- Produces: Complete Postgres DDL, tables (`profiles`, `career_profiles`, `profile_evidence`, `target_roles`, `skills`, `role_skills`, `user_skill_evidence`, `learning_plans`, `plan_items`, `lessons`, `lesson_progress`, `learning_events`, `portfolio_artifacts`, `interview_sessions`, `applications`, `outcome_summaries`), RLS policies, storage bucket configurations (`resumes`, `portfolio_evidence`, `lesson_assets`), and explicit grants.

- [ ] **Step 1: Write failing test verifying schema and RLS requirements**
  Create `tests/database_rls_contract.test.ts` parsing migration SQL files to verify:
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on every table.
  - Operation-specific policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
  - Storage bucket definitions and path policies `<user_id>/*`.
  - Explicit `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO authenticated`.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/database_rls_contract.test.ts` -> FAIL
- [ ] **Step 3: Write migration SQL scripts and seed data**
  Create `20261031000001_career_os_core_schema.sql` and `20261031000002_storage_and_grants.sql` adhering to the October 30, 2026 Data API rules and RLS owner predicates. Add initial seed data in `supabase/seed.sql` with curated roles, O*NET skills, and fixture lessons.
- [ ] **Step 4: Run migration against remote/local Supabase**
  Execute `npx supabase db push --db-url ...` or apply migrations to verify SQL syntax and constraints.
- [ ] **Step 5: Run contract test to verify it passes**
  Run `npx vitest run tests/database_rls_contract.test.ts` -> PASS

---

### Task 3: Generated Database Types & Shared Contracts (Part B Unblocking Milestone)

**Files:**
- Create: `src/types/database.generated.ts`
- Create: `src/lib/contracts/events.ts`
- Create: `src/lib/contracts/lesson-manifest.ts`
- Create: `src/lib/contracts/career.ts`
- Create: `content/lessons/sql-joins-v1.json`
- Create: `content/roles/junior-data-analyst.json`
- Test: `tests/contracts.test.ts`

**Interfaces:**
- Produces:
  - `Database`: Generated Supabase table/view types
  - `LearningEventSchema`: Zod validator for event envelopes
  - `LessonManifestSchema`: Zod validator for Part B lesson manifests
  - `CareerSkillMapSchema`, `WeeklyPlanSchema`: Shared data transfer types

- [ ] **Step 1: Write failing test for contracts and fixture validation**
  Create `tests/contracts.test.ts` validating sample event payloads, manifest fixtures (`sql-joins-v1.json`), and role fixtures (`junior-data-analyst.json`) against Zod schemas.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/contracts.test.ts` -> FAIL
- [ ] **Step 3: Generate database types and implement contracts**
  Run `npx supabase gen types typescript` to produce `src/types/database.generated.ts`. Implement Zod schemas in `src/lib/contracts/` with strict validations. Author `content/lessons/sql-joins-v1.json` and `content/roles/junior-data-analyst.json`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/contracts.test.ts` -> PASS
- [ ] **Step 5: Export shared contract package**
  Ensure types are clean, documented, and ready for Part B consumption without external dependencies.

---

### Task 4: Supabase Client/Server Session Infrastructure & Error Handling

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/api/errors.ts`
- Create: `src/lib/api/handler.ts`
- Test: `tests/api_errors.test.ts`

**Interfaces:**
- Produces:
  - `createBrowserClient()`: Public browser client
  - `createServerClient()`: SSR session-aware client
  - `apiError(code, message, status)`: Standardized API error responses `{error: {code, message, request_id}}`

- [ ] **Step 1: Write failing test for API error wrapper and status mappings**
  Create `tests/api_errors.test.ts` asserting 401, 403, 404, 409, 422, and 429 status formats and request ID propagation.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/api_errors.test.ts` -> FAIL
- [ ] **Step 3: Implement Supabase client helpers and `apiError`**
  Implement browser client, server client (using Next.js `cookies`), and `src/lib/api/errors.ts`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/api_errors.test.ts` -> PASS

---

### Task 5: Profile & Resume Intake and Human-in-the-Loop Review

**Files:**
- Create: `src/lib/career/resume-parser.ts`
- Create: `src/lib/career/profile-service.ts`
- Create: `app/api/v1/profile/imports/route.ts`
- Create: `app/api/v1/profile/route.ts`
- Create: `app/profile/page.tsx`
- Test: `tests/resume_intake.test.ts`

**Interfaces:**
- Consumes: PDF/DOCX file stream or text input
- Produces: Extracted skill claims with source excerpts and confidence ratings, saved to `profile_evidence` only after explicit user confirmation.

- [ ] **Step 1: Write failing test for resume parsing and review workflow**
  Create `tests/resume_intake.test.ts` ensuring parser extracts structured skills with source locators (page/paragraph), and that unconfirmed claims are not marked `Demonstrated`.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/resume_intake.test.ts` -> FAIL
- [ ] **Step 3: Implement extraction parser, profile service, and API routes**
  Implement `parseResumeText()`, profile CRUD in `profile-service.ts`, and Next.js routes `/api/v1/profile/imports` and `/api/v1/profile`. Build the profile review UI in `app/profile/page.tsx`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/resume_intake.test.ts` -> PASS

---

### Task 6: Target-Role Intake & Sourced Skill-Gap Map Engine

**Files:**
- Create: `src/lib/career/skill-gap-engine.ts`
- Create: `src/lib/career/role-service.ts`
- Create: `app/api/v1/roles/route.ts`
- Create: `app/api/v1/roles/[id]/skill-map/route.ts`
- Create: `app/map/page.tsx`
- Test: `tests/skill_gap_engine.test.ts`

**Interfaces:**
- Consumes: Target role description (or seed role ID) and user `profile_evidence`
- Produces: Transparent gap map with states (`Demonstrated`, `Supported`, `Transferable`, `Gap`, `Unknown`), priority scores ($P = I \times G \times C$), and transferable bridge explanations.

- [ ] **Step 1: Write failing test for skill-gap calculation and state assignment**
  Create `tests/skill_gap_engine.test.ts` testing priority calculation, adjacent transferable skill explanations, and verifying that unknown capability is never classified as a closed gap.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/skill_gap_engine.test.ts` -> FAIL
- [ ] **Step 3: Implement `SkillGapEngine`, role service, and skill-map API**
  Build normalization logic, transferable skill heuristics, and route handler for `/api/v1/roles/[id]/skill-map`. Build interactive Career Map UI in `app/map/page.tsx`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/skill_gap_engine.test.ts` -> PASS

---

### Task 7: Personalized Weekly Plan Generator, Edit, Approval & Portfolio Projects

**Files:**
- Create: `src/lib/career/plan-generator.ts`
- Create: `src/lib/career/portfolio-service.ts`
- Create: `app/api/v1/plans/route.ts`
- Create: `app/api/v1/plans/[id]/approve/route.ts`
- Create: `app/api/v1/portfolio/route.ts`
- Create: `app/plan/page.tsx`
- Create: `app/portfolio/page.tsx`
- Test: `tests/plan_generator.test.ts`

**Interfaces:**
- Consumes: Skill gaps, weekly time budget, and learning preferences
- Produces: 4-week structured plan (max 3 primary tasks/week, rationale, time estimate, completion criteria, `lesson_id` links to Part B) and 1-3 portfolio project briefs.

- [ ] **Step 1: Write failing test for weekly plan generation constraints**
  Create `tests/plan_generator.test.ts` asserting max 3 tasks/week, total weekly minutes $\le$ budget, prerequisite sequencing, and immutable plan version checks on approval.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/plan_generator.test.ts` -> FAIL
- [ ] **Step 3: Implement `PlanGenerator`, approval workflow, and portfolio service**
  Implement deterministic constraint scheduler and task generator in `plan-generator.ts`. Implement plan approval API (with 409 stale version detection). Build Plan UI (`app/plan/page.tsx`) and Portfolio UI (`app/portfolio/page.tsx`).
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/plan_generator.test.ts` -> PASS

---

### Task 8: Tutor Event Ingestion & Plan/Skill Evidence Consumer (Part B Handoff)

**Files:**
- Create: `src/lib/career/learning-event-consumer.ts`
- Create: `app/api/v1/learning-events/route.ts`
- Test: `tests/learning_event_consumer.test.ts`

**Interfaces:**
- Consumes: Inbound `learning_events` from Part B Tutor (`lesson.completed`, `lesson.check_submitted`)
- Produces: Idempotent updates to `plan_items.status = 'completed'` and `user_skill_evidence`

- [ ] **Step 1: Write failing test for idempotent learning event consumption**
  Create `tests/learning_event_consumer.test.ts` emitting `lesson.completed` and `lesson.check_submitted`. Test:
  - Event deduplication by `event_id` and `(user_id, idempotency_key)`.
  - Linked `plan_item` transitions from `in_progress` to `completed`.
  - Skill status updates to `Demonstrated` with evidence type `assessment`.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/learning_event_consumer.test.ts` -> FAIL
- [ ] **Step 3: Implement `LearningEventConsumer` and API handler**
  Build event processing transaction in `learning-event-consumer.ts` and `POST /api/v1/learning-events` endpoint returning 202 Accepted.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/learning_event_consumer.test.ts` -> PASS

---

### Task 9: Mock Interview Rubric Engine & Feedback Scorer

**Files:**
- Create: `src/lib/career/interview-engine.ts`
- Create: `app/api/v1/interviews/route.ts`
- Create: `app/api/v1/interviews/[id]/responses/route.ts`
- Create: `app/practice/page.tsx`
- Test: `tests/interview_engine.test.ts`

**Interfaces:**
- Consumes: Target role ID and skill requirements
- Produces: 5 role-linked interview questions, 1-4 anchored rubric scoring, answer citation extraction, and actionable practice feedback.

- [ ] **Step 1: Write failing test for interview scoring and feedback**
  Create `tests/interview_engine.test.ts` verifying that scoring evaluates criteria 1-4, cites answer excerpts, and generates next practice action without demographic inference.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/interview_engine.test.ts` -> FAIL
- [ ] **Step 3: Implement interview engine and API routes**
  Implement question bank and rubric evaluator in `interview-engine.ts`. Build typed interview practice UI in `app/practice/page.tsx`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/interview_engine.test.ts` -> PASS

---

### Task 10: Application Tracker, Outcome Summaries & Adaptive Proposals

**Files:**
- Create: `src/lib/career/application-service.ts`
- Create: `src/lib/career/adaptation-engine.ts`
- Create: `app/api/v1/applications/route.ts`
- Create: `app/api/v1/applications/[id]/route.ts`
- Create: `app/api/v1/outcomes/summary/route.ts`
- Create: `app/api/v1/plans/[id]/adaptation-proposals/route.ts`
- Create: `app/applications/page.tsx`
- Test: `tests/applications_and_adaptation.test.ts`

**Interfaces:**
- Consumes: Job applications, stages, response dates, and outcomes
- Produces: Funnel metrics (with $n \ge 5$ threshold guardrails) and proposed plan adjustments with visual diffs requiring explicit user approval.

- [ ] **Step 1: Write failing test for funnel metrics and adaptation proposals**
  Create `tests/applications_and_adaptation.test.ts` verifying:
  - $n < 5$ applications flags data as directional without causal claims.
  - Plan adaptation proposal returns explicit diff and rationale.
  - Automatic silent plan changes are blocked.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/applications_and_adaptation.test.ts` -> FAIL
- [ ] **Step 3: Implement application service, adaptation engine, and routes**
  Build funnel statistics calculation, adaptation proposal generator, and UI in `app/applications/page.tsx`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/applications_and_adaptation.test.ts` -> PASS

---

### Task 11: Unified Career Dashboard & Shell Navigation

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/dashboard/WeeklyProgressWidget.tsx`
- Create: `src/components/dashboard/NextActionWidget.tsx`
- Create: `src/components/dashboard/ReadinessSummaryWidget.tsx`
- Test: `tests/dashboard_widgets.test.ts`

**Interfaces:**
- Consumes: Active user profile, approved plan, recent evidence, and application summary
- Produces: Unified home view with primary next action (e.g. "Continue SQL Joins Lesson in Tutor"), weekly progress bar, and readiness breakdown.

- [ ] **Step 1: Write failing test for dashboard aggregation logic**
  Create `tests/dashboard_widgets.test.ts` testing priority action determination, readiness calculation, and navigation links.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run tests/dashboard_widgets.test.ts` -> FAIL
- [ ] **Step 3: Implement responsive navigation shell and dashboard widgets**
  Create `Navbar.tsx`, `app/layout.tsx`, and `app/page.tsx` with clean, modern styling following the Anthropic frontend design principles.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run tests/dashboard_widgets.test.ts` -> PASS

---

### Task 12: End-to-End Verification, Cross-Tenant Security Audit & Handoff Package

**Files:**
- Create: `tests/e2e_integration_flow.test.ts`
- Create: `tests/cross_tenant_security.test.ts`
- Create: `README.md`
- Test: All suites

**Interfaces:**
- Produces: Complete verified Part A build and published integration documentation for Part B.

- [ ] **Step 1: Write cross-tenant isolation and end-to-end integration test**
  Create `tests/cross_tenant_security.test.ts` verifying that User A cannot read or mutate User B's rows or storage. Create `tests/e2e_integration_flow.test.ts` simulating: Profile -> Target Role -> Gap Map -> Plan -> Tutor Event -> Plan Completed -> Artifact Created -> Application Logged.
- [ ] **Step 2: Run full test suite to verify passes**
  Run `npx vitest run` -> 100% PASS on all unit, integration, and security tests.
- [ ] **Step 3: Write comprehensive `README.md` and integration handoff**
  Document local setup, migration commands, type generation, API reference, event contracts for Part B, and test execution instructions.
- [ ] **Step 4: Final verification and build smoke test**
  Run TypeScript type check (`npx tsc --noEmit`) and verification commands.
