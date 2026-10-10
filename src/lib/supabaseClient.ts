import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseDiagnostics, Invoice } from '../types';

const STORAGE_KEY_URL = 'invoicepulse_supabase_url';
const STORAGE_KEY_ANON = 'invoicepulse_supabase_anon';

// Robust RFC4122 v4 UUID generator for safe PostgreSQL UUID primary keys
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
      return createSupabaseClient(url.trim(), anonKey.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

// Deep Database Diagnostic Analyzer
export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<DatabaseDiagnostics> {
  const url = (testUrl || getStoredSupabaseConfig().url || '').trim();
  const anonKey = (testKey || getStoredSupabaseConfig().anonKey || '').trim();

  const timestamp = new Date().toLocaleTimeString();

  if (!url || !anonKey) {
    return {
      connected: false,
      message: 'No credentials configured. Running in Local Simulated Mode.',
      url: url || 'None',
      hasInvoicesTable: false,
      hasProfilesTable: false,
      rowCountInvoices: 0,
      rowCountProfiles: 0,
      lastCheckedAt: timestamp,
    };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      connected: false,
      message: 'Invalid URL format. Supabase URL must start with https:// and end with .supabase.co',
      url,
      hasInvoicesTable: false,
      hasProfilesTable: false,
      rowCountInvoices: 0,
      rowCountProfiles: 0,
      lastCheckedAt: timestamp,
      errorDetail: 'Expected pattern: https://<project-ref>.supabase.co',
    };
  }

  try {
    const client = createSupabaseClient(url, anonKey);

    // 1. Check profiles table
    let hasProfiles = false;
    let profilesCount = 0;
    const { data: pData, error: pError } = await client
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (!pError) {
      hasProfiles = true;
      profilesCount = pData ? pData.length : 0;
    }

    // 2. Check invoices table
    let hasInvoices = false;
    let invoicesCount = 0;
    const { data: iData, error: iError } = await client
      .from('invoices')
      .select('id', { count: 'exact', head: true });

    if (!iError) {
      hasInvoices = true;
      invoicesCount = iData ? iData.length : 0;
    }

    if (!hasProfiles && !hasInvoices) {
      // Endpoint reachable, but tables not yet created
      const errMsg = pError?.message || iError?.message || 'Tables not found';
      return {
        connected: true,
        message: 'Connected to Supabase endpoint! However, the database tables are not yet created.',
        url,
        hasInvoicesTable: false,
        hasProfilesTable: false,
        rowCountInvoices: 0,
        rowCountProfiles: 0,
        lastCheckedAt: timestamp,
        errorDetail: `Supabase returned: "${errMsg}". Run the SQL script from the "Supabase Schema" tab in your Supabase SQL Editor.`,
      };
    }

    return {
      connected: true,
      message: `Database connection verified! Tables 'profiles' and 'invoices' are operational.`,
      url,
      hasInvoicesTable: hasInvoices,
      hasProfilesTable: hasProfiles,
      rowCountInvoices: invoicesCount,
      rowCountProfiles: profilesCount,
      lastCheckedAt: timestamp,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: 'Network or authorization failure connecting to Supabase.',
      url,
      hasInvoicesTable: false,
      hasProfilesTable: false,
      rowCountInvoices: 0,
      rowCountProfiles: 0,
      lastCheckedAt: timestamp,
      errorDetail: err.message || 'Unknown network error',
    };
  }
}
