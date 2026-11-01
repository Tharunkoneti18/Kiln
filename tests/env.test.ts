import { describe, it, expect, beforeEach } from 'vitest';
import { getEnv } from '../src/lib/env';

describe('Environment Validator getEnv()', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws an error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    expect(() => getEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('throws an error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it('returns validated env object when all required variables are valid', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://nvqfhmwchybhvdfwrqbs.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_test';
    process.env.SUPABASE_PROJECT_REF = 'nvqfhmwchybhvdfwrqbs';

    const env = getEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://nvqfhmwchybhvdfwrqbs.supabase.co');
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('sb_publishable_test');
    expect(env.SUPABASE_PROJECT_REF).toBe('nvqfhmwchybhvdfwrqbs');
  });
});
