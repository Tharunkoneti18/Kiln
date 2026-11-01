# Career OS

Product requirements and implementation blueprint

A build-ready plan for turning career evidence into learning, proof, and reachable opportunities

Version 1.0  |  31 October 2026  |  MVP planning baseline

> **PRODUCT DECISION** Career OS is a career transition system, not a resume chatbot. The MVP closes one measurable loop: assess a target role, learn the highest-value gaps, prove capability, and use observed application outcomes to adjust the next action.

## Executive summary

Career OS helps a person move from current capabilities toward a specific job outcome. A user supplies a resume or profile and target roles. The product extracts evidence-backed skills, compares them with real role requirements, explains gaps and transferable strengths, then creates an achievable weekly plan. Each plan item can open a prepared Tutor lesson with a 3D instructor, voice narration, synchronized whiteboard, and pause-and-resume progress. Learners produce portfolio evidence, practice a rubric-scored interview, and track applications. The system learns from completed work and application responses so recommendations change for a reason the user can inspect.

The MVP is split into two parallel workstreams. Part A owns career intelligence, plans, proof, interviews, applications, and shared data/API foundations. Part B owns the Tutor experience and lesson runtime. A versioned contract lets both teammates build against mocks before integration. The plan keeps content curated and avatar behavior simple: reliable structured lessons beat open-ended generated lectures and a costly bespoke avatar pipeline.

## 1. Product direction and problem

### 1.1 Problem statement

Career changers and early-career professionals have fragmented signals: resumes describe past work, job ads describe desired capability, courses teach generic content, portfolios show uneven evidence, and application outcomes are rarely used to improve the strategy. They cannot easily answer which roles are realistic now, what is the smallest credible gap to close, how to demonstrate the missing capability, and what to do after rejection or silence.

### 1.2 Product promise

For a selected target role, Career OS turns current capabilities into a transparent transition route: a ranked skill-gap map, adaptive weekly plan, guided instruction, demonstrable work, practice, and an outcome-aware application workflow.

### 1.3 Product loop

| Stage | User question | Product output | Evidence captured |
| --- | --- | --- | --- |
| Discover | What can I do and where can I go? | Profile, target-role shortlist, evidence-backed skill map | Resume/profile claims, job requirements, user confirmation |
| Engineer | What should I do next? | Ranked gap priorities and weekly plan | Time budget, preferences, baseline and confidence |
| Learn | Can I build this skill? | Tutor lesson, practice, saved progress | Lesson events, quiz results, help requests |
| Prove | How can I show it? | Portfolio brief and evidence record | Artifact, rubric, reflection, skill links |
| Convert | Is this moving me toward work? | Interview practice, application pipeline, outcome insights | Applications, stages, responses |
| Adapt | What changes now? | Explainable plan update and next action | New evidence, assessment, application outcomes |

## 2. Users, jobs to be done, and outcomes

| User | Need | MVP outcome |
| --- | --- | --- |
| Career pivoting professional | Translate experience into a credible adjacent or new role | Realistic target, transferable evidence, stepwise bridge |
| Early-career job seeker | Prioritize skills and build proof without generic courses | Role-linked learning tasks and portfolio artifacts |
| Returning or underemployed worker | Rebuild confidence and momentum with a manageable plan | Flexible targets, resumable sessions, visible progress |
| Content operator | Publish trustworthy lessons and maintain mappings | Versioned lessons, rubrics, sources and accessibility metadata |

### 2.1 Core jobs to be done

- When I choose a target role, show which requirements I support with evidence, which I may have, and which are unknown.
- When time is limited, turn the highest-value gaps into a realistic weekly plan and explain why each item matters.
- When I begin a lesson, teach through voice and visuals, pause at any point, and restore the exact point and board state later.
- When I finish learning, help me create proof tied to a skill instead of recording course completion alone.
- When I apply or receive a response, use it to suggest a concrete next adjustment without claiming certainty from sparse data.
## 3. Goals, non-goals, and principles

### 3.1 MVP goals

- Deliver an end-to-end path from profile and target role to saved weekly plan, working Tutor lesson, evidence artifact, mock interview feedback, and application outcomes.
- Make recommendations inspectable: show source, confidence, recency, and user corrections.
- Persist Tutor state across pause, refresh, sign-out, and return, restoring segment, transcript, and board.
- Adapt plans using demonstrated learning and application outcomes with an explanation and user control.
- Let two developers ship in parallel against stable contracts and shared identity.
### 3.2 Non-goals for first release

- Automated job applications, recruiter messages, or external posts. External actions remain user-controlled.
- Universal labor-market forecasts or promises of employment, salary, or interview success.
- Unrestricted generative course authoring, web-scale crawling, or real-time labor-market pipelines. Use curated role samples and licensed/public data.
- Photorealistic/custom-trained avatar, real-time facial animation, lip-sync fidelity, VR, group classroom, or arbitrary 3D scenes.
- Native mobile applications, enterprise administration, payments, credential issuance. Responsive web is the MVP.
- Resume rewriting or applications submitted without user review.
### 3.3 Product principles

- Evidence before confidence: distinguish observed, inferred, self-reported, and assessed signals.
- Show the why: recommendations cite role requirements, user evidence, or outcomes.
- Prefer work samples to completion badges.
- Resume anywhere: save after meaningful events and explicitly on pause/exit.
- Graceful degradation: mute voice, reduce motion, disable 3D; keep the lesson usable.
- Human control: users correct profiles, edit plans, dismiss recommendations, and delete data.
## 4. Target experience and information architecture

| Area | Primary screen | Purpose |
| --- | --- | --- |
| Home | Career dashboard | Next action, weekly progress, readiness, recent evidence |
| Career Map | Target role and skill-gap map | Compare evidence to requirements and inspect sources |
| Plan | Weekly learning plan | Schedule, reorder, resize, skip or regenerate tasks |
| Tutor | Lesson room | Learn from lecture, voice, board, avatar and practice |
| Portfolio | Evidence library | Create and review skill-linked work samples |
| Practice | Mock interview | Practice target questions and review rubric evidence |
| Applications | Application tracker | Track stages, dates, outcomes and patterns |
| Profile | Career profile/settings | Review imported evidence, privacy, accessibility |

### 4.1 First-session journey

1. Create account; set region, language, accessibility and weekly time budget.
1. Upload PDF/DOCX or enter profile; review and edit extracted facts before saving.
1. Select a target role or paste its description; confirm role constraints.
1. Review the explainable gap map; correct levels and mark unverified claims.
1. Generate a four-week plan with time estimates and a “why this task” explanation.
1. Open a task in Tutor, complete a lesson/check, and create or link proof.
1. Practice a mock interview and review criterion-level feedback.
1. Track applications and outcomes; inspect any proposed plan adjustment before it takes effect.
## 5. Functional requirements

| ID | Capability | Acceptance-oriented requirement | Priority |
| --- | --- | --- | --- |
| FR-01 | Account/consent | Sign-in, user-owned data, export/delete request and privacy settings | Must |
| FR-02 | Profile intake | PDF/DOCX extraction; preview/edit; retain source and timestamps | Must |
| FR-03 | Role intake | Search/select role or paste JD; preserve source and source date | Must |
| FR-04 | Skill evidence map | Normalize role needs/profile skills; show state, confidence, provenance, importance | Must |
| FR-05 | Transferable skills | Explain adjacent skills and bridge; never silently equate | Must |
| FR-06 | Project suggestions | 1–3 scoped projects per priority gap with output, rubric, time estimate | Must |
| FR-07 | Weekly plan | Create 2–8 week plan (default 4); schedule, reorder, edit, pause, skip, regenerate | Must |
| FR-08 | Tutor player | Structured materials, accessible board, simple 3D instructor, narration and transcript | Must |
| FR-09 | Synchronized timeline | Sequence narration and board events from one manifest; pause/seek/resume consistent | Must |
| FR-10 | Progress | Autosave checkpoints and explicit pause; persist segment, position, board and quiz state | Must |
| FR-11 | Knowledge checks | Short check with feedback, skill mapping and confidence update | Must |
| FR-12 | Mock interview | Role questions, rubric scoring and evidence-linked feedback; typed MVP | Must |
| FR-13 | Applications | Track role/company/date/stage/outcome; manual entry | Must |
| FR-14 | Outcome learning | Summarize funnel when sample threshold met; suggest experiments; approve changes | Must |
| FR-15 | Dashboard | Goal, next action, weekly completion, proof, practice and applications | Must |
| FR-16 | Content operations | Versioned role templates, lessons, rubrics, citations, accessibility data | Should |
| FR-17 | Reminders | Optional in-product learning reminders, quiet by default | Should |
| FR-18 | Reachability | Connect each proven skill to requirement and reachable next step | Must |

## 6. Career intelligence specification

### 6.1 Skill-gap map

Represent role requirements separately from user evidence. A keyword match is not demonstrated proficiency. Each skill has a canonical label, taxonomy/source identifier, aliases, role importance, user evidence links, evidence type, self/assessment rating, inferred level, confidence, recency and confirmation state.

| State | Definition | UI treatment |
| --- | --- | --- |
| Demonstrated | Work sample/project/assessment supports capability | Evidence badge and clickable proof |
| Supported | Profile suggests it; direct proof absent | Show source excerpt and request confirmation |
| Transferable | Adjacent evidence may transfer after a stated bridge | Amber; name bridge and uncertainty |
| Gap | Role asks for it; evidence does not support it | Prioritize by importance and effort |
| Unknown | Information is insufficient/conflicting | Ask a focused question; do not treat as absent |

Initial heuristic, to calibrate: priority = role importance × gap magnitude × evidence confidence × outcome relevance, normalized 0–100. Show component values and evidence. This is a navigation aid, not a hiring probability.

### 6.2 Role and skill data

For an initial English-language, US-focused pilot, use user-provided job descriptions plus a small curated role library. O*NET provides occupation and skills data and a developer API; use it as a taxonomy/reference layer, attribute it, and verify usage terms before redistribution. User-provided descriptions remain the freshest role-specific source. Store provider, URL/identifier, import date, geography and license status for each source.

### 6.3 Plan generation rules

- Ask weekly hours, preferred days, deadline and learning mode. If missing, suggest 3–5 hours/week as an editable default.
- Generate four weeks by default, with no more than three primary tasks per week; each task has objective, skill links, time range, materials, completion definition and expected evidence.
- Sequence prerequisites; alternate instruction, practice, retrieval and proof; reserve buffer time.
- Statuses: queued, in_progress, completed, skipped, blocked. Record why an adaptation happened.
- Adapt using user edits, checks, task timing or application outcomes; separate learning evidence from market evidence.
- Show a diff; require approval before substantial schedule or target-role change.
## 7. Tutor learning environment

### 7.1 Experience layout

Desktop: left lesson outline/progress, center whiteboard, right instructor and materials, bottom controls for play/pause, seek, speed, volume, captions and save status. On narrow screens, collapse outline/materials into drawers. Lesson text and references remain available at any time.

### 7.2 Prepared lesson model

Lessons are curated, versioned content packs rather than arbitrary documents interpreted live. Each has objective, prerequisites, segments, narration text, optional audio, image/document references, timed board events, prompts, checks, citations, accessibility descriptions and estimated duration. Uploaded source material is reviewed into approved lessons; user uploads never become shared content by default.

### 7.3 Board event contract

Events are deterministic and replayable. MVP types: clear, text, line, arrow, rectangle, circle, grid, image, highlight, erase and pause_prompt. Each has event_id, segment_id, offset_ms from segment start, duration_ms, z_index, payload and accessible_text. Use normalized 0–1 canvas coordinates. Rebuild by replaying to saved cursor; checkpoint board snapshot every 10–20 events.

Example: {"event_id":"e12","segment_id":"s2","offset_ms":8400,"type":"text","payload":{"x":0.08,"y":0.22,"text":"Input → Process → Output","font_scale":0.06},"accessible_text":"The instructor writes Input, then Process, then Output."}

### 7.4 Playback and resume rules

- One playback controller owns the canonical clock; narration and board subscribe to it.
- Pause stops narration and events, saves state, and reports “Saved” only after persistence succeeds. If save fails, retain local state and show retry.
- Resume restores lesson/version, segment, media position, board cursor/state, quiz answers, speed, captions and saved timestamp.
- Seeking recomputes the board to the requested cursor and seeks audio when supported; TTS resumes at a sentence boundary.
- Pin lesson version for an active learner; do not silently replace a started lesson.
- Autosave on segment change, answer, pause, visibility change and at least every 15 seconds while active. Do not rely on unload alone.
### 7.5 3D and voice scope

Use one licensed, low-poly/stylized rigged avatar with idle, speaking, pointing and listening states beside the board. Honor reduced motion and provide static/2D fallback. Narration can be authored audio or a server-side TTS adapter. Browser-native speech synthesis is demo fallback only because voices and behavior vary by device. MVP voice means narrated instruction; optional user speech input only if a supported provider exists. Open-ended interruptible voice tutoring is post-MVP.

### 7.6 Tutor acceptance criteria

- A seeded lesson plays narration and timed board events from the same timeline with captions/transcript.
- Pause, refresh and return restores segment and board state within one-second audio position tolerance; TTS resumes at nearest sentence boundary.
- Save failure is never shown as success; retry is idempotent.
- Board has keyboard-readable text equivalent; lesson works with 3D disabled and audio muted.
- Completion records lesson version, criteria, check results and linked skills.
## 8. Mock interviews, proof, and opportunity reachability

### 8.1 Interview rubric

Questions are tagged to target skills and level. MVP supports typed answers; recording is optional and consent-based. Score each criterion 1–4 using anchored descriptions. Feedback cites answer evidence, separates content from delivery, and gives one practice action. Criteria can include framing, technical accuracy, reasoning, trade-offs, communication and relevance. Do not infer protected traits, accent quality, personality or hireability.

### 8.2 Portfolio evidence

Each project includes a brief, constraints, success rubric, suggested artifacts, time estimate and skill mapping. A learner uploads URL/file or describes evidence and labels claims demonstrated, self-reported or assessed. Draft help is allowed, but users own work and review generated copy. Share links are opt-in and revocable.

### 8.3 Making the future more reachable

- Adjacent-role ladder: show a primary target and nearer roles reusing more demonstrated skills; state the remaining bridge.
- Opportunity distance: show milestones, time budget and evidence needed, not a probability of employment. Compare routes by effort, constraints and skill reuse.
- Action graph: connect every requirement to learning, proof, interview practice and application; a missing link becomes a next action.
- Proof-first profile: turn validated work into concise evidence statements with artifact links/dates; never inflate experience.
- Constraint-aware plans: honor user-provided hours, location, work mode, accessibility, schedule and budget constraints.
- Outcome experiments: with sparse data suggest small changes and report counts/uncertainty; do not claim causality from a handful of applications.
- Human network actions: recommend a concrete low-cost step, such as requesting feedback; do not scrape contacts or send messages.
### 8.4 Application tracking and learning

Track company, role, source URL, location/work mode, applied date, profile version, optional referral, stage, response date, outcome and notes. Default stages: saved, preparing, applied, recruiter_screen, interview, offer, rejected, withdrawn, no_response. Show denominators/date ranges; require at least five observations per comparison and mark small samples directional. Suggestions are hypotheses and require user approval before changing the plan.

## 9. Technical blueprint

### 9.1 Recommended MVP architecture

Greenfield assumption: responsive web app, two developers, four to six build weeks plus hardening. Use a modular monolith: fast to ship, with clear ownership boundaries.

| Layer | Recommendation | Boundary |
| --- | --- | --- |
| Web client | Next.js + TypeScript | Career and Tutor feature areas under shared shell |
| API | TypeScript modules; versioned REST/JSON at /api/v1 | Career and Tutor endpoint ownership separated |
| Database | PostgreSQL; checked-in migrations, one migration owner | Separate modules; shared IDs/contracts only |
| Files | Private object storage and short-lived signed URLs | Resume, lessons and evidence private by default |
| Background work | Queue/worker for parsing, plans, audio and summaries | Idempotent jobs with status/retries |
| AI adapters | Provider-neutral extraction/generation/scoring/TTS interfaces | Persist provider/model/template version |
| 3D runtime | Three.js/WebGL with static fallback | Tutor client feature; no server rendering |
| Telemetry | Privacy-filtered events/errors/latency | No raw resumes, transcripts or answers in analytics |

Use O*NET as a taxonomy layer, not a substitute for current employer descriptions. Three.js documents a WebGL 2 renderer. SpeechSynthesis supports pause/resume but device voices vary; abstract the provider. See section 16.

### 9.2 System flow

Browser → authenticated API → Career module → PostgreSQL. Uploads use private storage and signed URLs; parsing and plan generation run as queued jobs. Tutor fetches a published manifest and assets; one playback clock emits progress events. Tutor completion/check emits a versioned learning event consumed by Career. Application updates emit outcome events; adaptation returns a proposed plan diff for approval.

### 9.3 Reliability, security and accessibility

- Enforce owner_id authorization on every read/write; private storage; short-lived links.
- Use TLS, encrypted storage, server-side secrets and content-free logs.
- Validate uploads by type, size and parser isolation; suggested caps: 10 MB resume, 50 MB evidence.
- Rate-limit AI endpoints; idempotency keys on retryable jobs/writes.
- Provide deletion/export; define retention for resumes, generated artifacts and recordings. Interview recording off by default; delete raw audio after evaluation unless retained by choice.
- Validate structured AI output; treat documents as untrusted input and ignore embedded instructions.
- Target WCAG 2.2 AA for core flows where feasible: keyboard, captions, contrast, focus, reduced motion, alt text and non-3D fallback.
## 10. Shared data contract

Use UUIDs; every record includes created_at/updated_at in UTC and user_id tenant boundary. JSON fields are versioned and validated. Deletion follows a documented purge schedule.

| Entity | Key fields | Owner / notes |
| --- | --- | --- |
| user_profile | user_id, region, language, weekly_minutes, accessibility_prefs | Shared identity; A migration owner |
| career_profile | id, user_id, summary, source_status | A; reviewed profile snapshot |
| profile_evidence | id, profile_id, kind, excerpt, source_uri, confidence, verified_at | A; avoid unnecessary raw resume copies |
| target_role | id, user_id, title, region, level, jd_text, source_uri, source_date | A; user JD and seed roles |
| skill | id, canonical_name, taxonomy, taxonomy_id, aliases | A; shared read contract |
| role_skill | role_id, skill_id, importance, source_ref, confidence | A; sourced demand |
| user_skill_evidence | user_id, skill_id, state, level, evidence_ids, confidence, assessed_at | A; evidence snapshot |
| learning_plan | id, user_id, role_id, version, status, rationale, approved_at | A; immutable versions |
| plan_item | id, plan_id, skill_ids, lesson_id, type, week, minutes, status, rationale | A; links to B lesson_id |
| lesson | id, slug, version, title, skills, manifest_uri, status, duration | B schema proposal; A migration review |
| lesson_progress | id, user_id, lesson_id, version, segment_id, position_ms, cursor, snapshot, quiz_state | B API owner; resumable checkpoint |
| learning_event | id, user_id, lesson_id, event_type, payload_version, payload, occurred_at | B emits, A consumes idempotently |
| portfolio_artifact | id, user_id, title, uri, skill_ids, rubric, visibility, verified_state | A; private by default |
| interview_session | id, user_id, role_id, rubric_version, status, score_summary | A; criterion-linked feedback |
| application | id, user_id, role_snapshot, company, stage, applied_at, outcome | A; manual data |
| outcome_summary | id, user_id, window, sample_size, metrics, caveats, proposed_actions | A; suppress overconfident small samples |

### 10.1 Event envelope

{event_id, event_type, schema_version, user_id, aggregate_id, occurred_at, idempotency_key, payload}. Consumers ignore duplicate IDs/keys and safely reject unknown versions. Do not put personal content in event names or analytics properties.

## 11. API contracts and integration boundary

All routes require authenticated user context. Error shape: {error:{code,message,request_id,details?}}. Statuses: 401 unauthenticated, 403 wrong owner, 404 unavailable, 409 stale version, 422 invalid data, 429 rate limited. Long AI work returns job_id and status endpoint.

| Method + path | Owner | Request / response contract |
| --- | --- | --- |
| POST /api/v1/profile/imports | A | {file_id} → {job_id,status} |
| GET/PATCH /api/v1/profile | A | Read/update; PATCH {version,fields} → updated version |
| POST /api/v1/roles | A | {title,region,level,jd_text?,source_url?} → role |
| POST /api/v1/roles/{id}/assessment-jobs | A | {profile_version} → {job_id}; result includes map/provenance |
| GET /api/v1/roles/{id}/skill-map | A | {profile_version,role_version,skills:[{skill_id,label,state,importance,confidence,evidence[],source_refs[]}]} |
| POST /api/v1/plans | A | {role_id,weekly_minutes,horizon_weeks,preferences} → job_id |
| GET /api/v1/plans/{id} | A | {plan_id,version,status,items,rationale}; versions immutable |
| POST /api/v1/plans/{id}/approve | A | {version} → approved plan; 409 if stale |
| GET /api/v1/lessons/{id} | B | Published manifest, version, signed asset URLs, checksum |
| GET /api/v1/lessons/{id}/progress | B | Checkpoint or {progress:null} |
| PUT /api/v1/lessons/{id}/progress | B | Version, segment, position_ms, event_cursor, board_snapshot, quiz_state; idempotent upsert |
| POST /api/v1/learning-events | B→A | Versioned event envelope; dedupe by event_id; 202 accepted |
| POST /api/v1/interviews | A | {role_id,skill_ids,mode:"text"} → session/questions/rubric |
| POST /api/v1/interviews/{id}/responses | A | {question_id,response_text} → evaluation job |
| POST /api/v1/applications | A | Application data → application |
| PATCH /api/v1/applications/{id} | A | {version,stage,outcome,...} → update or 409 |
| GET /api/v1/outcomes/summary | A | {window} → counts, rates, sample_size, caveats, actions |
| POST /api/v1/plans/{id}/adaptation-proposals | A | {trigger_event_ids} → proposal diff/reason/confidence; explicit approve |

### 11.1 Tutor manifest

Minimum: {lesson_id, version, title, objective, estimated_seconds, skill_ids[], segments:[{segment_id,title,narration_text,audio_asset?,duration_ms,board_events[],materials[],checkpoint?}], quiz:[...], accessibility:{transcript,descriptions[],captions_asset?}, sources:[{label,url,accessed_at}], checksum}. Events are offset from segment start. Published manifests are immutable.

### 11.2 Ownership and change control

- A owns auth, shared IDs, migrations, error model, profile, role, skill, plan, proof, interview, application, outcomes and dashboard.
- B owns Tutor UI, lesson player, renderer, manifest validation, progress service and learning event emission. B proposes lesson/progress schemas; A reviews shared migrations.
- Neither workstream writes directly to the other’s tables; cross-feature interaction uses APIs/events.
- Breaking contracts require a version bump, migration note and both owners’ approval. Weekly integration review resolves conflicts.
## 12. MVP work split and parallel plan

### 12.1 Part A — Career Intelligence Engine

- Shared foundation: auth/session, user boundary, API errors, migrations, event envelope, storage, CI and preview.
- Resume intake/review and target-role intake; seeded role library and JD parsing.
- Skill ontology/evidence gap map; confidence/provenance; adjacent paths.
- Weekly plan generation/edit/approval, project suggestions and portfolio artifacts.
- Interview rubric, application tracker, outcome summaries, adaptation proposals and dashboard.
- Consume Tutor completion/check events and update plan progress.
### 12.2 Part B — Tutor and Learning Experience

- Tutor page, responsive layout, lesson outline/materials and accessibility controls.
- Lesson manifest schema, validation and seeded lesson packs with sources and board timeline.
- Whiteboard renderer, deterministic replay/checkpoint/restore and keyboard-readable equivalent.
- 3D avatar states, reduced-motion and static fallback.
- Narration adapter, transcript/captions, single playback clock, seek/pause/resume.
- Progress save/resume, quiz/check capture, idempotent events; mock API until A endpoints are ready.
### 12.3 Shared ownership

| Shared item | Driver | Other input | Done when |
| --- | --- | --- | --- |
| Contract/OpenAPI | A | B reviews Tutor/event paths | Schemas, fixtures, mock server/client |
| Visual tokens/auth shell | A | B defines navigation needs | Both feature routes share shell |
| Migrations | A | B submits schema proposal | One owner; access boundary reviewed |
| Seed content | B lessons / A roles | Cross-review IDs and sources | Reproducible fixtures; no real personal data |
| Integration environment | A | B tests/reports | Preview with shared auth/storage |
| Release/demo | Joint | Joint | Role → plan → Tutor → proof/application works |

### 12.4 Milestones — six-week baseline

| Week | Part A | Part B | Integration gate |
| --- | --- | --- | --- |
| 1 Align | Schema, auth/API skeleton, profile/role data | Wireframe, manifest v1, events, avatar licensing | Contract v1 frozen; shared IDs and errors agreed |
| 2 Thin slice | Profile/role intake, fixtures, map endpoint stub | Tutor layout, manifest loader, board primitives | Local demos work against fixtures/mocks |
| 3 Core | Profile review, skill map, plan generation/edit | Playback controller, narration/transcript, board timing | Role → plan item → seeded lesson |
| 4 Evidence | Portfolio, applications, interview rubric | Avatar, seek/pause/resume, persistence, checks | Refresh/resume and learning event wired |
| 5 Adapt | Outcome summary/proposal/dashboard | Accessibility polish, failure/retry, curated lessons | Plan reflects lesson/check evidence |
| 6 Harden | Permissions, delete/export, performance | Cross-browser fallback and save reliability | Acceptance run, telemetry and demo rehearsal |

Baseline assumes two full-time developers, credentials, UI starter and no production compliance certification. Part-time or inexperienced teams should plan 8–10 weeks. Do not push parsing, Tutor persistence and authorization into the last week.

## 13. Acceptance criteria and release gate

| Journey | Pass condition |
| --- | --- |
| Assessment | Import/enter profile, choose role, correct claims and inspect sourced/confident states; unknown is not misclassified as gap. |
| Plan | Four-week plan respects time; each task has duration, objective, skill link, rationale and completion definition; edits/approval persist. |
| Tutor | Narration, captions, avatar/static fallback, synchronized board and controls work; pause/refresh/reopen restores state; save failures retry. |
| Learning evidence | Completion/check reaches Part A once despite retries and updates skill/plan status with provenance. |
| Portfolio | Create private artifact linked to gaps; share only by opt-in. |
| Mock interview | At least five role-linked questions, criterion scores, cited feedback and a next practice action for one seeded role. |
| Applications | Track stages/outcome; dashboard shows counts/sample size and avoids misleading one-record rates. |
| Adaptation | Show trigger, evidence, confidence and diff; no automatic committed changes. |
| Privacy/accessibility | Cross-user access denied; keyboard journey, captions/transcript and reduced-motion/static Tutor path available. |
| Operations | Request IDs, job state, idempotent retries and cost/latency metrics without personal content. |

## 14. Metrics and instrumentation

| Metric | Definition | Guardrail |
| --- | --- | --- |
| Activation | Profile review + role + first gap map | Inspect cohort drop-off |
| Plan adoption | Plan approved or edited/approved | Segment by constraints |
| Time to first learning | Role confirmation to first Tutor task | Reduce friction |
| Tutor resume reliability | Restore after exit/reentry | ≥99% scripted QA; alert on save errors |
| Learning evidence rate | Completed tasks with check or artifact | Separate from playback/completion |
| Proof coverage | Priority gaps linked to artifact/assessment | Do not equate coverage with competence |
| Application funnel | Counts by stage/outcome/range | Show denominator; suppress n<5 insight |
| Adaptation usefulness | Accepted/edited/dismissed proposals | Never optimize for blind acceptance |
| Trust/correction | Profile/skill corrections and errors | Quality signal, not user blame |
| Cost/latency | AI/TTS cost and p50/p95 | Set pilot budget and alert limits |

Events: profile_import_started/completed, role_confirmed, assessment_viewed/corrected, plan_generated/approved/edited, lesson_started/paused/resumed/completed, progress_save_failed, check_submitted, artifact_created, interview_completed, application_stage_changed, adaptation_proposed/accepted/edited/dismissed. Use coarse properties and aggregate IDs; keep content in protected application tables.

## 15. Risks and deferred decisions

| Risk | Why it matters | Mitigation / owner |
| --- | --- | --- |
| Overconfident inference | Misleads user | Evidence states, sources, correction UI / A |
| Stale/biased role data | Bad priorities | User JD first, dates/region, data review / A |
| Unlicensed content/avatar | Legal/product risk | Track licenses and attribution / B |
| Tutor scope balloons | 3D/TTS/sync multiply complexity | One avatar, curated lessons, limited board set / B |
| Lost progress/timeline drift | Resume promise fails | Single clock, idempotent checkpoints / B |
| Hallucinated rubric feedback | Harmful advice | Anchors, cited answer evidence, correction / A |
| Sparse application outcomes | False conclusions | n≥5 comparisons, caveats, hypotheses only / A |
| Sensitive career data | Trust impact | Private storage, retention, deletion, recording opt-in / A |
| External API terms/cost | Dependency risk | Adapter, cache, attribution, no scraping by default / A |
| Workstream drift | Late integration | Contract first, fixtures, weekly integration / Joint |

### 15.1 Decisions before production

- Launch geography/job family; assume US-English and a curated role family for MVP.
- Auth, hosting, model/TTS and storage vendors; choose after checking access, residency and cost.
- Whether parsing and interview audio are enabled; typed alternatives stay usable.
- Retention/deletion SLA for resumes, lesson artifacts and recordings.
- AI budget, usage caps and fallback provider.
- Manual application entry versus user-selected export import.
## 16. Research notes and sources

Source requirements from the referenced conversation: resume and target-role intake; skill-gap map from real job descriptions; week-by-week plan; gap-matched portfolio suggestions; rubric-scored mock interviews; progress adaptation; response-aware application tracking. Later requirements add specialized weekly learning and a Tutor page with prepared lecture materials, 3D instructor, voice, synchronized board drawing/writing, and pause/resume-anytime. “Discover → Engineer → Prove → Convert” is operationalized as the loop in section 1.

- O*NET Resource Center, Database 31.0 and license/source guidance: https://www.onetcenter.org/database.html
- O*NET Web Services API reference: https://services.onetcenter.org/reference/start/overview
- Three.js WebGLRenderer reference: https://threejs.org/docs/pages/WebGLRenderer.html
- MDN SpeechSynthesis reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
Differentiation hypothesis: Career OS combines explicit evidence provenance, adaptive learning, resumable visual teaching, proof artifacts, interview practice and application outcome feedback in one user-controlled transition loop. Validate through customer and competitor research; this PRD does not claim no other product offers an individual capability.

## Appendix A — Example plan item and event

Plan item: {id, week:1, title:"Build a small SQL analysis", objective:"Demonstrate joins, aggregation, and clear findings", skill_ids:["sql","data-communication"], lesson_id:"sql-joins-v1", estimated_minutes:90, evidence_required:"query file + short explanation", completion_criteria:["Expected result","Explain a trade-off"], rationale:"Target role lists SQL; profile has adjacent spreadsheet evidence but no SQL proof", status:"queued"}.

Learning event: {event_id:"uuid", event_type:"lesson.check_submitted", schema_version:1, user_id:"uuid", aggregate_id:"lesson-progress-uuid", occurred_at:"ISO-8601 UTC", idempotency_key:"client-generated-uuid", payload:{lesson_id:"sql-joins", lesson_version:1, skill_ids:["sql"], score:0.8, rubric_version:"1", evidence_type:"assessment"}}.

## Appendix B — Build order

1. Create shell, auth guard, error model, migrations, event envelope and fixtures.
1. Complete thin slice: seeded role → gap map → plan → Tutor → persisted progress → learning event → plan update.
1. Add resume parsing/review and target-role intake; retain fixtures as regression scenarios.
1. Add projects, interview practice and application tracking.
1. Add outcome-aware proposal with approval and caveats.
1. Harden permissions, save failure recovery, accessibility, deletion/export, telemetry and demo flow.

## Implementation addendum — two-person delivery with Supabase

This addendum clarifies and supersedes the generic database/API choices in sections 9–12. It assumes “Deno” means Supabase Edge Functions. Use Supabase Postgres with Row Level Security (RLS) for row authorization; use Deno Edge Functions for authenticated server-side integrations and short-running orchestration. Do not build a separate CRUD API for data already safely served through Supabase’s client and RLS.

### A. Two owners who can work in parallel

| Owner | Owns | Can start immediately after shared contract kickoff | Must not take on |
| --- | --- | --- | --- |
| Person 1 — Platform and Career OS | Supabase project/bootstrap, Auth integration, schema and migrations, RLS/grants, generated database types, profile/resume intake, role intake, skill map, plan generation/approval, project/proof, interview, applications, outcome summaries, dashboard | Career routes and services against seeded fixtures; shared SQL baseline and migration ownership | Tutor player or whiteboard implementation |
| Person 2 — Tutor and Learning Experience | Tutor route/UI, lesson manifest/schema, curated lesson fixtures, whiteboard renderer, playback clock, narration/captions, avatar integration/fallback, progress UI, quiz/check UI, event emission | Build against the checked-in manifest/event TypeScript contracts and mock Supabase adapter; prepare fixture lessons and renderer | Editing shared Supabase migrations or bypassing RLS with a privileged key |

**Shared kickoff (half-day maximum):** agree user and lesson IDs, event envelope, status enums, Zod schemas, route names, sample fixtures, and the minimal tables below. Person 1 writes the database migration and generates types. Person 2 consumes the types and fixtures. Person 2 files schema changes as a small PR/request; Person 1 is the only migration author to prevent migration conflicts. Neither person waits for a complete feature from the other: both build against mocks until the first vertical slice.

**Integration gates:** (1) contract fixture check, (2) local Auth/RLS thin slice, (3) Tutor progress save/restore with real local Supabase, (4) career plan consumes a Tutor completion event, (5) cross-user isolation and release acceptance. Pair for one short integration session at each gate; otherwise keep ownership separate.

### B. Supabase boundary and access rules

| Concern | MVP choice |
| --- | --- |
| Identity | Supabase Auth. Use `auth.uid()` as the canonical user UUID. Don’t authorize from user-editable `raw_user_meta_data`. |
| Database | Supabase Postgres. Keep application tables in an exposed schema only when needed; put internal queue/worker data in a non-exposed schema where practical. |
| Client data access | `@supabase/supabase-js` and the current Next.js server/client SSR helpers; authenticated user JWT must reach Postgres so RLS remains active. |
| Server-side secrets | Model/TTS/provider keys only in Edge Function or trusted worker secrets. Never put service-role/secret keys in browser code or `NEXT_PUBLIC_*`. |
| Private files | Supabase Storage private buckets for resumes and portfolio evidence, with user-scoped `storage.objects` policies and short-lived signed URLs. Use distinct buckets/policies for resumes, evidence, and published lesson assets. |
| Long work | Queue resumable jobs for parsing and plan generation. Supabase Queues (pgmq) is a Postgres-native option; check current project/plan availability before adopting. Process in idempotent steps. Edge Functions should not run long, blocking document/model pipelines. |
| Realtime | Not needed for the MVP Tutor timeline; playback is client-local and progress is persisted. Add Realtime only if a user-visible multi-device/live collaboration need is validated. |

**Required security rules:** enable RLS on every user-data table in an exposed schema; define owner predicates for each operation. A baseline owner policy uses `TO authenticated` and `(select auth.uid()) = user_id`. `UPDATE` needs a `SELECT` policy plus both `USING` and `WITH CHECK`. Grant only the SQL privileges the application requires: grants decide whether a role can reach a table through the Data API, while RLS decides which rows it can access. Supabase changed new-table Data API exposure defaults on 30 October 2026, so migrations must explicitly review grants and exposure rather than assuming table creation exposes a route. RLS is still required either way.

For Storage, keep object paths under a first folder equal to the authenticated user ID (for example `<user_uuid>/resume/<file_uuid>.pdf`) and enforce the bucket plus folder owner in `storage.objects` policies. If allowing overwrite/upsert, include the required `SELECT`, `INSERT`, and `UPDATE` policies. Don’t make private user data public to simplify previews.

### C. Shared table and event contracts

Person 1 owns the migrations for all tables. Person 2 should use only these agreed contracts and submit schema changes for review.

| Table | Minimum contract | RLS/owner |
| --- | --- | --- |
| `profiles` | `id uuid primary key references auth.users`, `region`, `language`, `weekly_minutes`, preference JSON, timestamps | User reads/updates own row; prevent changing `id` away from `auth.uid()` |
| `career_profiles` | `id`, `user_id`, profile version, reviewed summary/status, timestamps | `user_id = auth.uid()` on select/insert/update/delete as needed |
| `profile_evidence` | `id`, `user_id`, source file ID, evidence kind, excerpt/claim, confidence, verification status, source locator | Owner only; source file in private Storage |
| `target_roles` | `id`, `user_id`, title, region, level, pasted description or private file reference, source URL/date, version | Owner only |
| `skills` / `role_skills` | canonical skill ID/name/taxonomy; role-skill importance and source reference | Published catalog is read-only to authenticated users; writes restricted to trusted seed/admin path |
| `user_skill_evidence` | `user_id`, `skill_id`, evidence IDs, state, level, confidence, assessed/verified time | Owner only |
| `learning_plans` / `plan_items` | role ID, immutable plan version, approval state, item type/week/minutes/status/skill IDs/lesson ID/rationale | Owner only; approve via version check |
| `lessons` | `id`, slug, version, title, skill IDs, manifest JSON or private/public asset URI, publish status | Authenticated read of published lessons; no learner write |
| `lesson_progress` | `user_id`, lesson ID/version, segment ID, position ms, event cursor, board snapshot, quiz state, saved time, version | Owner only; upsert by `(user_id, lesson_id, lesson_version)` |
| `learning_events` | event UUID, `user_id`, event type, schema version, aggregate ID, occurred time, idempotency key, validated payload JSON | User may insert own allowed event types; user may read own events only if the UI needs it; consumers are trusted server-side |
| `portfolio_artifacts`, `interview_sessions`, `applications` | MVP fields from section 10 plus `user_id`, timestamps, version | Owner only; private by default |

Learning event v1: `{event_id, event_type, schema_version, user_id, aggregate_id, occurred_at, idempotency_key, payload}`. Seed event types: `lesson.started`, `lesson.paused`, `lesson.completed`, `lesson.check_submitted`. Payload includes lesson ID/version, linked skill IDs, segment/check IDs, and score/result where applicable; never include raw resume or transcript in analytics. Enforce uniqueness on `event_id` (and/or `(user_id, idempotency_key)`) so network retries do not double-count progress. Career logic consumes events idempotently and creates a proposed skill/plan update with provenance.

### D. Files to create in the application repository

There is no application repository in the current workspace. The only user-facing files here are the PRD DOCX/Markdown; `work/build_prd.py` and `work/docx_to_markdown.py` are temporary document tooling, not product code. Start a repository with a structure like this; adapt names if the team already has a codebase:

```text
career-os/
  app/                         # Next.js routes: dashboard, map, plan, tutor, portfolio, practice, applications
  src/lib/supabase/client.ts   # Browser client; publishable key only
  src/lib/supabase/server.ts   # Server-side session-aware client
  src/lib/contracts/           # Shared Zod schemas, enums, request/event types, fixture payloads
  src/lib/career/              # Role matching, evidence scoring, plan validation and outcome metrics
  src/lib/tutor/               # Manifest validator, playback controller, board state reducer
  src/types/database.generated.ts  # Generated from local Supabase schema; never hand-edit
  content/lessons/             # Versioned JSON lesson manifests and attribution/accessibility metadata
  content/roles/               # Small curated role fixtures and source/refresh metadata
  supabase/config.toml         # Local Supabase configuration; no secrets
  supabase/migrations/         # Timestamped schema, grants, RLS and Storage policies; Person 1 owns
  supabase/seed.sql            # Synthetic local roles, lessons and test users/fixtures only
  supabase/functions/          # Short authenticated orchestration: assess-role, generate-plan, process-job
  supabase/tests/              # pgTAP: RLS isolation, grants, constraints, event idempotency
  workers/document-ingest/     # Optional separate Python worker only if parser needs exceed Edge runtime
  .env.example                 # Variable names and safe placeholders, never real credentials
  package.json + lockfile      # Exact dependency pins and reproducible installs
  README.md                    # Setup, local reset, type generation, test and deploy commands
```

Create these first: `supabase/config.toml`, initial migration, `seed.sql`, shared contracts/fixtures, generated database types, and the two session-aware Supabase client helpers. Commit migrations and lockfiles. Don’t commit `.env`, tokens, real resumes, production exports, generated user data, or real model keys.

### E. Reuse before building custom pipelines

| Need | Reuse | How to apply it safely |
| --- | --- | --- |
| Auth, Postgres, object storage, access control | Supabase Auth, Postgres, Storage, RLS and local CLI | Use local Supabase so both developers share reproducible migrations and seeds. Do not recreate sign-in, file delivery or per-row authorization. |
| Shared schema/types | Supabase CLI generated TypeScript types + Zod contracts | Generate `database.generated.ts` from the local DB; Zod validates external/model payloads at boundaries. Never edit generated types by hand. |
| DB correctness | `supabase test db` with pgTAP; `supabase db lint`; Supabase advisors | Start with tests for anon denial, user A vs user B, update ownership reassignment, Storage isolation, and duplicate event IDs. |
| Background work | Supabase Queues/pgmq if enabled for the selected plan; otherwise a small trusted worker consuming a Postgres jobs table/queue | Store only IDs and job metadata in queue messages, not raw resume bodies. Add retries, visibility timeout, idempotency, status and dead-letter handling. |
| PDF/DOCX extraction | PyMuPDF for PDF text; Mammoth for DOCX; Docling as a heavier fallback when layout/tables matter | Preserve page/paragraph source locators. Reject scanned/image-only documents with a clear upload message or route to OCR; do not claim exact extraction without review. Keep parsers isolated from the Edge Function. |
| Structured extraction and generation | A hosted general-purpose LLM API with strict JSON Schema/Structured Outputs; Zod validation after response | Use for resume/JD skill claims, rationales, project briefs, interview feedback, and plan drafts. Persist prompt/schema/model version. No model output writes directly to production tables; user reviews profile and plan first. |
| Skill and occupation vocabulary | O*NET Database/Web Services, including skills, transferable skills and occupations | Use as a US-oriented taxonomy seed, preserve O*NET IDs and license attribution. Pair with user-pasted job descriptions; O*NET is not a current individual vacancy feed. |
| Semantic retrieval (optional) | Supabase `pgvector` and a hosted embedding API or Sentence Transformers | Not required for MVP: first do canonical aliases + deterministic token matching. Add embeddings only if evaluation shows synonym recall remains poor; retain exact evidence/source links and evaluate false matches. |
| Tutor content format | JSON lesson manifest, static audio assets, deterministic board-event replay, standard WebVTT captions | Keep lessons authored/curated and versioned. Don’t generate board animation ad hoc while speaking. Runtime simply reads validated events and persists cursor/snapshot. |
| 3D instructor | Three.js and one licensed rigged GLB avatar; simple state changes (idle/speaking/pointing) | Use a static portrait/2D fallback. Avoid custom modelling, lip-sync pipeline, or multi-avatar system in the MVP. Verify the asset license before distribution. |
| Model evaluation | Golden fixtures for resume facts, role-skill mappings, plan constraints and rubric-scored responses | Keep a small human-reviewed dataset and measure extraction precision, unsupported claims, JSON validation errors, cost and latency before changing prompts/models. |

**Recommended MVP AI pipeline:** private upload → deterministic type/size validation → local/private text extraction with page/paragraph locators → LLM structured extraction into a versioned schema → runtime validation and source-span checks → user correction/review → normalized `profile_evidence` rows. For a role: user-provided JD → extract requirements with source spans and importance evidence → map to curated canonical skills → deterministic transparent gap score → user review. For plans: deterministic prerequisite/time-budget scheduler creates constraints → LLM drafts task prose/project ideas → schema and time/skill-link checks → preview and approval. For application outcomes: SQL calculates counts/rates; model may explain a pattern only after minimum sample checks and with caveats. Tutor playback is not a live AI generation pipeline; it plays the approved manifest.

### F. Start commands and model/provider choices

Before choosing CLI flags, check `supabase --help` and the relevant subcommand help because CLI flags change. Recommended sequence: use `supabase bootstrap` if the current CLI offers a suitable Next.js starter; otherwise `supabase init`, start the local stack, create migrations through the CLI, seed local fixtures, and link a remote project only after local schema/RLS review. Generate TypeScript DB types from local schema and run pgTAP/RLS tests in CI. Do not manually click-create production tables as the source of truth.

For MVP, use one hosted model provider for extraction and generation and keep it behind `src/lib/ai/provider.ts`. Pin the chosen model ID in server configuration; record it with prompt and schema versions so output changes are traceable. Use JSON Schema constrained outputs and runtime validation rather than prompt-only “return JSON.” If embeddings are later justified, use a supported embedding model through the same adapter and store its model/version/dimension alongside vectors. Do not fine-tune or host a model for the first version; build the evaluation set and evidence workflow first.

### G. Updated integration milestones

| Milestone | Person 1 — Supabase/Career | Person 2 — Tutor | Exit condition |
| --- | --- | --- | --- |
| Day 1 contract | Repo/bootstrap, auth, initial schema contract, migration owner, RLS/grant strategy, local fixture IDs | Tutor manifest/event schemas, route shell, mock adapter and fixture lesson | Both can run local app; schemas and event fixture agree |
| Week 1 parallel | Authenticated profile/role tables, initial migrations/RLS/grants, seed role and profile fixtures | Tutor page + manifest playback against fixtures; board primitive renderer | No code dependency between feature branches; both demo independently |
| Week 2 thin slice | Skill map and plan endpoints/functions; generated DB types | Narration/captions, playback clock, board timeline | Role → plan item → open lesson; Auth state persists |
| Week 3 save/restore | `lesson_progress` and `learning_events` schema/policies; event consumer updates task status | Resume checkpoint, pause/seek/refresh restore, quiz and idempotent event writes | Local Supabase test proves save/restore and duplicate suppression |
| Week 4 proof/conversion | Portfolio, mock interview, application tracker, outcome summaries | Avatar/fallback, responsive/accessibility polish, seed lessons | Complete learner journey joins the two streams |
| Week 5–6 harden | RLS/grant audit, cross-user tests, delete/export, metrics and deploy | Save failure recovery, cross-browser checks, event/version handling | Release acceptance passes; no privileged key in client; documentation current |

### H. Supabase release checklist

- Every exposed user-data table has RLS enabled and explicit least-privilege grants; every owner table has operation-specific policies.
- `UPDATE` paths have `SELECT`, `USING`, and `WITH CHECK`; policies cannot change `user_id` to another user.
- User A cannot read, update, delete or sign a URL for User B’s row/object; test with two real local test accounts, not only an admin SQL session.
- No service-role/secret key is sent to browser; Edge Functions preserve caller JWT context for user-owned reads/writes.
- Migrations explicitly set grants/exposure because new-table Data API defaults changed on 30 October 2026.
- Storage buckets are private unless an asset is intentionally published; Storage policies restrict bucket and user folder.
- Auth emails, redirect URLs, rate limits and SMTP are reviewed before production; local development uses local Supabase only.
- `supabase test db` and `supabase db lint` run in CI; check project advisors before release.

### I. Current primary references

- [Supabase local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows) — CLI bootstrap, local stack, migrations and seed files.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) and [securing the Data API](https://supabase.com/docs/guides/api/securing-your-api) — policies, grants and exposure.
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) — private object policies.
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) and [local function development](https://supabase.com/docs/guides/functions/development-environment) — Deno runtime, local serve, secrets and runtime limits.
- [Supabase Queues](https://supabase.com/docs/guides/queues) and [Supabase database testing](https://supabase.com/docs/guides/database/testing) — durable queue option and pgTAP.
- [Supabase changelog: breaking changes](https://supabase.com/changelog?types=breaking-change) — includes the 30 October 2026 Data API exposure default change.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — JSON Schema-constrained responses for extraction/generation.
- [Docling supported formats](https://docling-project.github.io/docling/usage/supported_formats/) — PDF and DOCX parsing option.
- [O*NET Database](https://www.onetcenter.org/database.html) and [O*NET license agreements](https://www.onetcenter.org/license_agreements.html) — occupation/skill data and attribution terms.
- [Supabase pgvector/AI guide](https://supabase.com/docs/guides/ai) — optional vector retrieval in Postgres.
