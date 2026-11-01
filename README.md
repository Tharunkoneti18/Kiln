# Career OS — Part A: Supabase Platform & Career Intelligence

Career OS is an AI-powered career navigation platform built with Next.js, TypeScript, and Supabase.
This repository contains the complete implementation of **Part A — Supabase Platform & Career Intelligence**, designed to operate in parallel with **Part B — Tutor and Learning Experience**.

---

## 🏗️ Architecture & Boundaries

```
┌────────────────────────────────────────────────────────┐
│                   Career OS Platform                   │
│                                                        │
│  [Part A: Career Intelligence & Supabase Platform]     │
│  ├── Profile & Resume Intake (Human-in-the-loop)       │
│  ├── Sourced Skill-Gap Map (Proven/Supported/Transf.) │
│  ├── Personalized 4-Week Plan Generator                │
│  ├── Portfolio Project Briefs & Rubric Engine         │
│  ├── Mock Interview Simulator (1-4 Anchored Rubrics)   │
│  ├── Job Application Funnel (n ≥ 5 Statistical Guard)  │
│  ├── Adaptive Plan Calibration with Visual Diffs       │
│  └── Tutor Event Consumer (Idempotent Ingestion)       │
│                                                        │
│  Handoff Boundary to [Part B: Tutor Learning Experience]│
│  ├── Inbound Events: POST /api/v1/learning-events      │
│  ├── Lesson Manifests: content/lessons/*.json          │
│  ├── Role Manifests: content/roles/*.json              │
│  └── Navigation Links: /tutor?lessonId={lesson_id}     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Local Development

### 1. Environment Configuration
Ensure `.env` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nvqfhmwchybhvdfwrqbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:Tharun%402018200@db.nvqfhmwchybhvdfwrqbs.supabase.co:5432/postgres
```

### 2. Run the Development Server
```bash
npm install
npm run dev
```
- Without `NEXT_PUBLIC_TUTOR_API_BASE_URL`, progress saves to browser `localStorage` in standalone mode.
- With `NEXT_PUBLIC_TUTOR_API_BASE_URL`, the Tutor calls Part A authenticated progress endpoints (`/api/v1/lessons/{id}/progress`).
Open [http://localhost:3000](http://localhost:3000) to view the unified Career Command Center and interactive navigation shell.

### 3. Run the Verification & Test Suite
```bash
npx vitest run
```
*Current test suite: 13 test files, 43 automated unit & integration tests passing 100%.*

### 4. Run TypeScript Typecheck
```bash
npx tsc --noEmit
```

---

## 📡 API Reference & Integration Points for Part B

### Part B -> Part A: Tutor Learning Event Ingestion
- **Endpoint**: `POST /api/v1/learning-events`
- **Status**: Returns `202 Accepted`
- **Contract Schema**: `src/lib/contracts/events.ts`
- **Envelope**:
```json
{
  "event_id": "99999999-9999-9999-9999-999999999999",
  "event_type": "lesson.completed",
  "schema_version": 1,
  "user_id": "user-uuid",
  "aggregate_id": "progress_sql_001",
  "occurred_at": "2026-10-31T12:00:00Z",
  "idempotency_key": "unique-idempotency-key",
  "payload": {
    "lesson_id": "sql-joins-v1",
    "lesson_version": 1,
    "skill_ids": ["sql"],
    "score": 1.0,
    "evidence_type": "assessment"
  }
}
```
*Idempotency Guard:* Deduplicated by `event_id` and `(user_id, idempotency_key)`. Automatically transitions linked `plan_items` to `completed` and upgrades `user_skill_evidence` to `Demonstrated`.

---

## 🎨 Design System & Customization
- Built using **Tailwind CSS** with modern, dark-slate aesthetics per Anthropic Frontend Design best practices.
- Fully modular widgets in `src/components/dashboard/` and pages in `app/`.
- Ready for iterative UI/UX enhancements and user-provided designs.
