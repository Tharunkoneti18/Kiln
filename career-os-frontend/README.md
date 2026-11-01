# Career OS Tutor (Part B)

The Tutor is the Part B learning room for Career OS. It teaches a curated career skill lesson through a synchronized whiteboard timeline, browser narration, transcript, lesson materials, a small 3D instructor, and resumable checkpoints. The sample lesson is SQL Foundations.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/tutor`. Use `npm test` for the unit/component suite and `npm run build` for a production build. Node.js 20.9 or newer is required by Next.js 16.

## Progress storage modes

- Without `NEXT_PUBLIC_TUTOR_API_BASE_URL`, progress saves to this browser's `localStorage` under the local demo learner. It survives refresh in the same browser profile, but it is not an authenticated, cross-device account store.
- With `NEXT_PUBLIC_TUTOR_API_BASE_URL`, the Tutor calls Part A's authenticated progress endpoints using same-site credentials. Part A must supply auth/session handling, API routes, ownership checks and RLS-backed persistence before this mode is ready for real users.
- `.env.local` is ignored by Git. `SUPABASE_SECRET_KEY` and any service/secret key must remain server-only and must never be placed in a `NEXT_PUBLIC_` variable. The Part B browser code does not read the secret key.

Copy `.env.example` to `.env.local` only when setting up a new machine. Keep real credentials local and rotate a credential if it is ever committed or shared publicly.

## Current implementation boundary

Part B owns the Tutor UI, versioned lesson manifest and validator, playback/board timeline, progress adapter and learning-event emission. Part A owns authentication, shared migrations, RLS/grants, generated database types and the API routes. No Supabase migration is included here. See [the Part A integration contract](docs/tutor-part-a-integration.md) and the [Career OS PRD](Career_OS_PRD_and_Build_Blueprint.md).

Lessons are curated JSON under `content/lessons/`. A published version is immutable; create a new manifest version to revise lesson content. Board coordinates are normalized to 0–1 and event offsets are relative to their segment.
