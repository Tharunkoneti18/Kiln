import { describe, it, expect } from 'vitest';
import { apiError, ApiErrorCode } from '../src/lib/api/errors';
import { createBrowserClient } from '../src/lib/supabase/client';

describe('API Errors & Supabase Client Infrastructure', () => {
  it('formats standardized error responses with request ID and status code', async () => {
    const response = apiError(ApiErrorCode.UNAUTHENTICATED, 'Missing or invalid token', 401, { reason: 'expired' });

    expect(response.status).toBe(401);
    const body = await response.json();

    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('UNAUTHENTICATED');
    expect(body.error.message).toBe('Missing or invalid token');
    expect(body.error.details).toEqual({ reason: 'expired' });
    expect(body.error.request_id).toBeDefined();
    expect(typeof body.error.request_id).toBe('string');
  });

  it('supports conflict (409) for version mismatch', async () => {
    const response = apiError(ApiErrorCode.CONFLICT, 'Plan version is stale', 409);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe('CONFLICT');
  });

  it('creates browser Supabase client with valid credentials', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://nvqfhmwchybhvdfwrqbs.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_8rHlb_u8pDyAeddwY-x2Xw_JFnWZXmE';

    const client = createBrowserClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
