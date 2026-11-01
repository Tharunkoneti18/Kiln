-- Career OS Migration 1: Core Schema & Row Level Security
-- Complies with Supabase Addendum & Data API security requirements

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  region text DEFAULT 'US',
  language text DEFAULT 'en',
  weekly_minutes integer DEFAULT 240,
  accessibility_prefs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_owner" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "profiles_insert_owner" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));


-- 2. Career Profiles Table
CREATE TABLE IF NOT EXISTS public.career_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version integer DEFAULT 1,
  summary text,
  source_status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_profiles_select_owner" ON public.career_profiles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "career_profiles_insert_owner" ON public.career_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "career_profiles_update_owner" ON public.career_profiles
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "career_profiles_delete_owner" ON public.career_profiles
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 3. Profile Evidence Table
CREATE TABLE IF NOT EXISTS public.profile_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file_id text,
  kind text NOT NULL,
  excerpt text NOT NULL,
  confidence numeric DEFAULT 0.8,
  verified_at timestamptz,
  source_locator jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profile_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_evidence_select_owner" ON public.profile_evidence
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "profile_evidence_insert_owner" ON public.profile_evidence
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "profile_evidence_update_owner" ON public.profile_evidence
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "profile_evidence_delete_owner" ON public.profile_evidence
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 4. Target Roles Table
CREATE TABLE IF NOT EXISTS public.target_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  region text DEFAULT 'US',
  level text DEFAULT 'mid',
  jd_text text,
  source_uri text,
  source_date date DEFAULT current_date,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_roles_select_owner" ON public.target_roles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "target_roles_insert_owner" ON public.target_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "target_roles_update_owner" ON public.target_roles
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "target_roles_delete_owner" ON public.target_roles
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 5. Skills Table (Shared Catalog)
CREATE TABLE IF NOT EXISTS public.skills (
  id text PRIMARY KEY,
  canonical_name text NOT NULL,
  taxonomy text DEFAULT 'onet',
  taxonomy_id text,
  aliases text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_all" ON public.skills
  FOR SELECT TO authenticated, anon
  USING (true);


-- 6. Role Skills Table
CREATE TABLE IF NOT EXISTS public.role_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.target_roles(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  importance numeric DEFAULT 1.0,
  source_ref text,
  confidence numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.role_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_skills_select_owner" ON public.role_skills
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.target_roles WHERE id = role_skills.role_id AND user_id = (select auth.uid())));

CREATE POLICY "role_skills_insert_owner" ON public.role_skills
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.target_roles WHERE id = role_skills.role_id AND user_id = (select auth.uid())));

CREATE POLICY "role_skills_update_owner" ON public.role_skills
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.target_roles WHERE id = role_skills.role_id AND user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.target_roles WHERE id = role_skills.role_id AND user_id = (select auth.uid())));

CREATE POLICY "role_skills_delete_owner" ON public.role_skills
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.target_roles WHERE id = role_skills.role_id AND user_id = (select auth.uid())));


-- 7. User Skill Evidence Table
CREATE TABLE IF NOT EXISTS public.user_skill_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'Unknown',
  level text DEFAULT 'intermediate',
  evidence_ids uuid[] DEFAULT '{}',
  confidence numeric DEFAULT 0.5,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

ALTER TABLE public.user_skill_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skill_evidence_select_owner" ON public.user_skill_evidence
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "user_skill_evidence_insert_owner" ON public.user_skill_evidence
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_skill_evidence_update_owner" ON public.user_skill_evidence
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_skill_evidence_delete_owner" ON public.user_skill_evidence
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 8. Learning Plans Table
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.target_roles(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  rationale text,
  horizon_weeks integer DEFAULT 4,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_plans_select_owner" ON public.learning_plans
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "learning_plans_insert_owner" ON public.learning_plans
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "learning_plans_update_owner" ON public.learning_plans
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "learning_plans_delete_owner" ON public.learning_plans
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 9. Plan Items Table
CREATE TABLE IF NOT EXISTS public.plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
  week integer NOT NULL,
  title text NOT NULL,
  objective text NOT NULL,
  skill_ids text[] NOT NULL DEFAULT '{}',
  lesson_id text,
  estimated_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'queued',
  evidence_required text,
  completion_criteria jsonb DEFAULT '[]'::jsonb,
  rationale text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_items_select_owner" ON public.plan_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_items.plan_id AND user_id = (select auth.uid())));

CREATE POLICY "plan_items_insert_owner" ON public.plan_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_items.plan_id AND user_id = (select auth.uid())));

CREATE POLICY "plan_items_update_owner" ON public.plan_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_items.plan_id AND user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_items.plan_id AND user_id = (select auth.uid())));

CREATE POLICY "plan_items_delete_owner" ON public.plan_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_items.plan_id AND user_id = (select auth.uid())));


-- 10. Lessons Table (Part B Curated Catalog)
CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  version integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  objective text,
  estimated_seconds integer DEFAULT 1800,
  skill_ids text[] DEFAULT '{}',
  manifest_uri text,
  manifest_json jsonb,
  status text DEFAULT 'published',
  duration_minutes integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_published" ON public.lessons
  FOR SELECT TO authenticated, anon
  USING (status = 'published');


-- 11. Lesson Progress Table (Part B Runtime State)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  lesson_version integer NOT NULL DEFAULT 1,
  segment_id text,
  position_ms integer DEFAULT 0,
  event_cursor integer DEFAULT 0,
  board_snapshot jsonb DEFAULT '{}'::jsonb,
  quiz_state jsonb DEFAULT '{}'::jsonb,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id, lesson_version)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress_select_owner" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "lesson_progress_insert_owner" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "lesson_progress_update_owner" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "lesson_progress_delete_owner" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 12. Learning Events Table (Part B -> Part A Handoff)
CREATE TABLE IF NOT EXISTS public.learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text,
  event_type text NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  aggregate_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  idempotency_key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idempotency_key)
);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_events_select_owner" ON public.learning_events
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "learning_events_insert_owner" ON public.learning_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));


-- 13. Portfolio Artifacts Table
CREATE TABLE IF NOT EXISTS public.portfolio_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  uri text NOT NULL,
  skill_ids text[] DEFAULT '{}',
  rubric jsonb DEFAULT '{}'::jsonb,
  visibility text DEFAULT 'private',
  verified_state text DEFAULT 'self_reported',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.portfolio_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_artifacts_select_owner" ON public.portfolio_artifacts
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "portfolio_artifacts_insert_owner" ON public.portfolio_artifacts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "portfolio_artifacts_update_owner" ON public.portfolio_artifacts
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "portfolio_artifacts_delete_owner" ON public.portfolio_artifacts
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 14. Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.target_roles(id) ON DELETE SET NULL,
  rubric_version text DEFAULT '1.0',
  status text DEFAULT 'completed',
  score_summary jsonb DEFAULT '{}'::jsonb,
  questions jsonb DEFAULT '[]'::jsonb,
  responses jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interview_sessions_select_owner" ON public.interview_sessions
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "interview_sessions_insert_owner" ON public.interview_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "interview_sessions_update_owner" ON public.interview_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "interview_sessions_delete_owner" ON public.interview_sessions
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 15. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role_title text NOT NULL,
  role_snapshot jsonb DEFAULT '{}'::jsonb,
  source_url text,
  location text,
  stage text NOT NULL DEFAULT 'saved',
  applied_at date,
  response_date date,
  outcome text,
  notes text,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_owner" ON public.applications
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "applications_insert_owner" ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "applications_update_owner" ON public.applications
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "applications_delete_owner" ON public.applications
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));


-- 16. Outcome Summaries Table
CREATE TABLE IF NOT EXISTS public.outcome_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "window" text NOT NULL DEFAULT 'all_time',
  sample_size integer NOT NULL DEFAULT 0,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  caveats text[] DEFAULT '{}',
  proposed_actions jsonb DEFAULT '[]'::jsonb,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE public.outcome_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outcome_summaries_select_owner" ON public.outcome_summaries
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "outcome_summaries_insert_owner" ON public.outcome_summaries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "outcome_summaries_update_owner" ON public.outcome_summaries
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "outcome_summaries_delete_owner" ON public.outcome_summaries
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
