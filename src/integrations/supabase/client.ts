// This file is temporarily modified for mock Supabase until env vars provided.
// Create .env.local from .env.example for real setup.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase;

// Mock client if env missing
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Supabase env vars missing. Using functional mock client for demo. Check TODO.md');

  const listeners: ((event: string, session: any) => void)[] = [];

  supabase = {
    auth: {
      getSession: async () => {
        const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
        return { data: { session }, error: null };
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        console.log('[Mock] Signing in with', email);
        const session = { user: { email, app_metadata: { provider: 'email' }, user_metadata: {} }, access_token: 'mock-token' };
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        listeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user: session.user, session }, error: null };
      },
      signUp: async ({ email, options }: any) => {
        console.log('[Mock] Signing up', email);
        const session = { user: { email, app_metadata: { provider: 'email' }, user_metadata: options?.data || {} }, access_token: 'mock-token' };
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        listeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user: session.user, session }, error: null };
      },
      resetPasswordForEmail: async (email: string) => {
        console.log('[Mock] Resetting password for', email);
        return { data: {}, error: null };
      },
      onAuthStateChange: (cb: any) => {
        listeners.push(cb);
        const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
        if (session) setTimeout(() => cb('INITIAL_SESSION', session), 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(cb);
                if (idx > -1) listeners.splice(idx, 1);
              }
            }
          }
        };
      },
      signOut: async () => {
        localStorage.removeItem('supabase.auth.token');
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { data: null, error: null };
      },
      signInWithOAuth: async ({ provider, options }: any) => {
        console.log('[Mock] OAuth sign in with', provider);
        const url = options?.redirectTo || window.location.origin;
        window.location.href = url;
        return { data: {}, error: null };
      }
    },
    functions: {
      invoke: async (name: string, { body }: any) => {
        console.log(`[Mock] Invoking edge function: ${name}`, body);
        if (name === 'compliance-verify') {
          // Simulate latency
          await new Promise(resolve => setTimeout(resolve, 800));
          return {
            data: {
              status: "verified",
              verification: {
                hash: body.stepId === 'sof' ? "7f83b127ff24053643dd730704bd25966f9a721d9b921c17244907a957b4255d" : "0x" + Math.random().toString(16).slice(2),
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 31536000000).toISOString(), // 1 year
                riskScore: "Low",
                errorMessage: null
              }
            },
            error: null
          };
        }
        return { data: null, error: new Error(`Function ${name} not implemented in mock`) };
      }
    },
    from: () => ({
      select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => { },
  } as any;
} else {
  supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export { supabase };

