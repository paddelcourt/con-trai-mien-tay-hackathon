import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily created browser client - avoids SSR evaluation issues
let _client: SupabaseClient | null = null;

function getSupabaseBrowser(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return _client;
}

// Proxy object that forwards all property accesses to the lazily-created client
export const supabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowser();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
