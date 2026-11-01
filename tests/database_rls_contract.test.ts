import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Database Schema & RLS Contract Tests', () => {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  const migration1 = path.join(migrationsDir, '20261031000001_career_os_core_schema.sql');
  const migration2 = path.join(migrationsDir, '20261031000002_storage_and_grants.sql');

  it('migration files must exist', () => {
    expect(fs.existsSync(migration1)).toBe(true);
    expect(fs.existsSync(migration2)).toBe(true);
  });

  it('enforces RLS on every public table', () => {
    const sql = fs.readFileSync(migration1, 'utf8') + '\n' + fs.readFileSync(migration2, 'utf8');

    const expectedTables = [
      'profiles',
      'career_profiles',
      'profile_evidence',
      'target_roles',
      'skills',
      'role_skills',
      'user_skill_evidence',
      'learning_plans',
      'plan_items',
      'lessons',
      'lesson_progress',
      'learning_events',
      'portfolio_artifacts',
      'interview_sessions',
      'applications',
      'outcome_summaries',
    ];

    for (const table of expectedTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('verifies owner-based RLS policies for user tables', () => {
    const sql = fs.readFileSync(migration1, 'utf8') + '\n' + fs.readFileSync(migration2, 'utf8');

    // Check user_id = auth.uid()
    expect(sql).toContain('auth.uid()');

    // Check UPDATE policies have both USING and WITH CHECK
    expect(sql).toMatch(/CREATE POLICY .* ON public\.career_profiles\s+FOR UPDATE[\s\S]*USING[\s\S]*WITH CHECK/);
    expect(sql).toMatch(/CREATE POLICY .* ON public\.target_roles\s+FOR UPDATE[\s\S]*USING[\s\S]*WITH CHECK/);
    expect(sql).toMatch(/CREATE POLICY .* ON public\.applications\s+FOR UPDATE[\s\S]*USING[\s\S]*WITH CHECK/);
  });

  it('verifies private storage buckets and user folder access policies', () => {
    const sql = fs.readFileSync(migration2, 'utf8');

    // Private buckets: resumes, portfolio_evidence, lesson_assets
    expect(sql).toContain("'resumes'");
    expect(sql).toContain("'portfolio_evidence'");
    expect(sql).toContain("'lesson_assets'");
    expect(sql).toContain('public = false');

    // Storage RLS check
    expect(sql).toContain('storage.objects');
    expect(sql).toContain('(storage.foldername(name))[1] = (select auth.uid()::text)');
  });

  it('verifies explicit grants for authenticated role', () => {
    const sql = fs.readFileSync(migration2, 'utf8');
    expect(sql).toContain('GRANT USAGE ON SCHEMA public TO authenticated');
    expect(sql).toContain('GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated');
  });
});
