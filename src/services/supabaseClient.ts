import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration from environment variables or localStorage
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = 
    (import.meta.env.VITE_SUPABASE_URL as string) || 
    (typeof window !== 'undefined' ? localStorage.getItem('sogiacquy_supabase_url') || '' : '');

  const anonKey = 
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 
    (typeof window !== 'undefined' ? localStorage.getItem('sogiacquy_supabase_anon_key') || '' : '');

  return { url: url.trim(), anonKey: anonKey.trim() };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export function updateSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sogiacquy_supabase_url', url.trim());
    localStorage.setItem('sogiacquy_supabase_anon_key', anonKey.trim());
  }
  supabaseInstance = null; // Reset to force re-instantiation
  getSupabase();
}

// Auto-fetch config from backend /api/config on production (Render)
export async function initSupabaseFromBackend(): Promise<SupabaseClient | null> {
  const current = getSupabase();
  if (current) return current;

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        updateSupabaseConfig(data.supabaseUrl, data.supabaseAnonKey);
        return getSupabase();
      }
    }
  } catch {
    // Offline or local
  }
  return null;
}
