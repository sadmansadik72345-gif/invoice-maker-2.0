import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'invoicepulse_supabase_url';
const STORAGE_KEY_ANON = 'invoicepulse_supabase_anon';

export function getStoredSupabaseConfig() {
  if (typeof window === 'undefined') return { url: '', anonKey: '' };
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window === 'undefined') return;
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
}

export function getLiveSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      return createSupabaseClient(url, anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}
