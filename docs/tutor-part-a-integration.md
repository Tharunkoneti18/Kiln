# Part A & Part B Tutor Integration Contract

This document specifies the integration contract between **Part A (Supabase Platform & Career Intelligence)** and **Part B (Tutor & Learning Experience)**.

---

## Progress Storage & Checkpoint API

### 1. Fetch Lesson Progress Checkpoint
- **Method & Route**: `GET /api/v1/lessons/{id}/progress`
- **Description**: Returns the persisted progress checkpoint for the authenticated learner or `null` if no checkpoint exists.
- **Response**:
```json
{
  "progress": {
    "lesson_id": "sql-joins-v1",
    "lesson_version": 1,
    "segment_id": "seg_intro",
    "position_ms": 15000,
    "event_cursor": 2,
    "board_snapshot": {},
    "quiz_state": {},
    "saved_at": "2026-10-31T12:00:00Z"
  }
}
```

### 2. Save Lesson Progress Checkpoint
- **Method & Route**: `PUT /api/v1/lessons/{id}/progress`
- **Description**: Idempotently saves or updates the progress checkpoint for `(user_id, lesson_id, lesson_version)`.
- **Request Body**:
```json
{
  "lesson_version": 1,
  "segment_id": "seg_intro",
  "position_ms": 15000,
  "event_cursor": 2,
  "board_snapshot": {},
  "quiz_state": {}
}
```

---

## Learning Event Ingestion

### 3. Emit Learning Event
- **Method & Route**: `POST /api/v1/learning-events`
- **Headers**:
  - `Content-Type: application/json`
  - `Idempotency-Key: <unique-uuid-or-key>`
- **Description**: Ingests Part B learning events (`lesson.started`, `lesson.paused`, `lesson.completed`, `lesson.check_submitted`) into Part A.
- **Contract Payload**:
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
