import { createClient } from '@supabase/supabase-js';
import type { Database } from '@menuos/database';

/**
 * Admin client that bypasses RLS using the service role key.
 * ONLY use server-side for trusted operations (e.g. registration bootstrapping).
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
