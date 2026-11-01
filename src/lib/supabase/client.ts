import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from '@/src/types/database.generated';

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

  return createSupabaseBrowserClient<Database>(url, anonKey);
}

export const supabase = {
  from: (table: string) => {
    try {
      const client = createBrowserClient();
      return client.from(table as any);
    } catch {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            eq: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
        }),
        upsert: async () => ({ data: null, error: null }),
      };
    }
  },
};
