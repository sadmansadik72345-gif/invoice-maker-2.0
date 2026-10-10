import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Invoice, InvoiceItem, DatabaseDiagnostics } from '../types';
import { 
  getLiveSupabaseClient, 
  generateUUID, 
  testSupabaseConnection 
} from '../lib/supabaseClient';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  invoices: Invoice[];
  activeView: 'dashboard' | 'admin' | 'login' | 'code' | 'schema';
  setActiveView: (view: 'dashboard' | 'admin' | 'login' | 'code' | 'schema') => void;
  signIn: (identifier: string, passwordInput: string) => { success: boolean; message?: string };
  signUp: (email: string, passwordInput: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
  switchPersona: (email: string) => void;
  createOrUpdateInvoice: (invoiceData: Omit<Invoice, 'id' | 'created_at'> & { id?: string }) => Promise<{ success: boolean; invoice: Invoice; message: string }>;
  updateInvoiceStatus: (id: string, status: 'draft' | 'pending' | 'paid' | 'overdue') => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  duplicateInvoice: (invoice: Invoice) => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (inv: Invoice | null) => void;
  createUserAccount: (email: string, fullName: string, role: 'admin' | 'user') => Promise<{ success: boolean; message: string }>;
  activeInvoiceForPrint: Invoice | null;
  setActiveInvoiceForPrint: (inv: Invoice | null) => void;
  diagnostics: DatabaseDiagnostics | null;
  isDiagnosticsLoading: boolean;
  runDiagnostics: () => Promise<DatabaseDiagnostics>;
  syncWithSupabase: () => Promise<void>;
  seedDemoDataToSupabase: () => Promise<{ success: boolean; message: string }>;
}

// Standards-compliant UUIDs for initial users to prevent PostgreSQL UUID cast exceptions
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    email: 'admin@invoicepulse.dev',
    full_name: 'Arthur Vance',
    role: 'admin',
    password: 'admin123',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    email: 'alex@freelance.io',
    full_name: 'Alex Rivera',
    role: 'user',
    password: 'password123',
    created_at: '2026-02-10T11:20:00Z',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    email: 'elena@designcraft.co',
    full_name: 'Elena Rostova',
    role: 'user',
    password: 'password123',
    created_at: '2026-03-01T14:45:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'f1111111-1111-4111-8111-111111111111',
    user_id: 'b0000000-0000-4000-8000-000000000002',
    invoice_number: 'INV-1001',
    currency: 'USD',
    client_name: 'Apex Global Logistics',
    client_email: 'finance@apexlogistics.com',
    client_address: '742 Evergreen Terrace, Sector 4\nChicago, IL 60601',
    sender_name: 'Alex Rivera Consulting',
    sender_email: 'alex@freelance.io',
    sender_address: '450 Mission St, San Francisco, CA',
    issue_date: '2026-03-25',
    due_date: '2026-04-08',
    items: [
      { id: '1', description: 'Next.js 14 Web Architecture Audit', quantity: 1, unitPrice: 2400, total: 2400 },
      { id: '2', description: 'Supabase RLS & Role-Based Auth Hardening', quantity: 12, unitPrice: 150, total: 1800 },
      { id: '3', description: 'Vercel Deployment Pipeline Optimization', quantity: 4, unitPrice: 175, total: 700 },
    ],
    subtotal: 4900,
    discount_percent: 5,
    discount_amount: 245,
    tax_percent: 8,
    tax_amount: 372.4,
    total_amount: 5027.4,
    status: 'paid',
    notes: 'Payment received via Wire Transfer. Thank you for your partnership!',
    created_at: '2026-03-25T10:15:00Z',
    created_by_email: 'alex@freelance.io',
  },
  {
    id: 'f2222222-2222-4222-8222-222222222222',
    user_id: 'b0000000-0000-4000-8000-000000000002',
    invoice_number: 'INV-1002',
    currency: 'USD',
    client_name: 'Starlight Media Labs',
    client_email: 'accounts@starlight.io',
    client_address: '100 Broadway, 14th Floor\nNew York, NY 10005',
    sender_name: 'Alex Rivera Consulting',
    sender_email: 'alex@freelance.io',
    sender_address: '450 Mission St, San Francisco, CA',
    issue_date: '2026-04-01',
    due_date: '2026-04-15',
    items: [
      { id: '1', description: 'Interactive Dashboard Component Suite', quantity: 1, unitPrice: 3200, total: 3200 },
      { id: '2', description: 'Print-Ready PDF CSS Styling & Testing', quantity: 6, unitPrice: 120, total: 720 },
    ],
    subtotal: 3920,
    discount_percent: 0,
    discount_amount: 0,
    tax_percent: 10,
    tax_amount: 392,
    total_amount: 4312,
    status: 'pending',
    notes: 'Net 14 payment terms. Please remit payment via ACH or credit card.',
    created_at: '2026-04-01T15:30:00Z',
    created_by_email: 'alex@freelance.io',
  },
  {
    id: 'f3333333-3333-4333-8333-333333333333',
    user_id: 'c0000000-0000-4000-8000-000000000003',
    invoice_number: 'INV-1003',
    currency: 'EUR',
    client_name: 'Nordic Clean Energy Ltd',
    client_email: 'invoicing@nordic-energy.se',
    client_address: 'Kungsgatan 12, Stockholm, Sweden',
    sender_name: 'Elena Rostova Studio',
    sender_email: 'elena@designcraft.co',
    sender_address: 'Berlin, Germany',
    issue_date: '2026-04-03',
    due_date: '2026-04-17',
    items: [
      { id: '1', description: 'Enterprise Brand Identity & Typography System', quantity: 1, unitPrice: 4800, total: 4800 },
      { id: '2', description: 'Tailwind Design System Tokens', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    subtotal: 6000,
    discount_percent: 0,
    discount_amount: 0,
    tax_percent: 0,
    tax_amount: 0,
    total_amount: 6000,
    status: 'pending',
    notes: 'Reverse charge applicable for EU cross-border B2B supply.',
    created_at: '2026-04-03T09:00:00Z',
    created_by_email: 'elena@designcraft.co',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('invoicepulse_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[1]; // Default to Alex Rivera
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('invoicepulse_users_list');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial users to ensure default admin/user are always present
          const existingIds = new Set(parsed.map((p: any) => p.email.toLowerCase()));
          const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.email.toLowerCase()));
          return [...parsed, ...missing];
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoicepulse_invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_INVOICES;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'admin' | 'login' | 'code' | 'schema'>('dashboard');
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const [isDiagnosticsLoading, setIsDiagnosticsLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('invoicepulse_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('invoicepulse_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('invoicepulse_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('invoicepulse_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Run initial diagnostic check and sync with Supabase automatically on mount
  const runDiagnostics = async (): Promise<DatabaseDiagnostics> => {
    setIsDiagnosticsLoading(true);
    try {
      const diag = await testSupabaseConnection();
      setDiagnostics(diag);
      setIsDiagnosticsLoading(false);
      return diag;
    } catch (e: any) {
      const fallback: DatabaseDiagnostics = {
        connected: false,
        message: 'Diagnostics failed: ' + e.message,
        url: '',
        hasInvoicesTable: false,
        hasProfilesTable: false,
        rowCountInvoices: 0,
        rowCountProfiles: 0,
        lastCheckedAt: new Date().toLocaleTimeString(),
      };
      setDiagnostics(fallback);
      setIsDiagnosticsLoading(false);
      return fallback;
    }
  };

  // Fetch from remote Supabase Cloud database
  const syncWithSupabase = async () => {
    const client = getLiveSupabaseClient();
    if (!client) return;

    try {
      // 1. Fetch remote invoices from Supabase
      const { data: remoteInvoices, error: invErr } = await client
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!invErr && remoteInvoices && remoteInvoices.length > 0) {
        setInvoices(remoteInvoices);
        localStorage.setItem('invoicepulse_invoices', JSON.stringify(remoteInvoices));
      }

      // 2. Fetch remote profiles
      const { data: remoteProfiles, error: profErr } = await client
        .from('profiles')
        .select('*');

      if (!profErr && remoteProfiles && remoteProfiles.length > 0) {
        setUsers((prev) => {
          const merged = [...prev];
          remoteProfiles.forEach((rp: any) => {
            if (!merged.some((m) => m.email.toLowerCase() === rp.email.toLowerCase())) {
              merged.push(rp);
            }
          });
          return merged;
        });
      }

      await runDiagnostics();
    } catch (err) {
      console.warn('Sync notice:', err);
    }
  };

  useEffect(() => {
    runDiagnostics();
    syncWithSupabase();
  }, []);

  // Strict Login: Does NOT create random accounts on wrong password/info!
  const signIn = (inputIdentifier: string, passwordInput: string): { success: boolean; message?: string } => {
    const clean = inputIdentifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!clean) {
      return { success: false, message: 'Please enter your username or email.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Please enter your password.' };
    }

    // 1. Admin Account check
    if (clean === 'admin' || clean === 'admin@invoicepulse.dev') {
      if (cleanPass !== 'admin123') {
        return { success: false, message: 'Incorrect password for Admin. Please use "admin123".' };
      }
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
      setActiveView('admin');
      return { success: true };
    }

    // 2. Default User check ('user' or 'alex')
    if (clean === 'user' || clean === 'alex' || clean === 'alex@freelance.io') {
      if (cleanPass !== 'password123' && cleanPass !== 'user123') {
        return { success: false, message: 'Incorrect password for User. Please use "password123".' };
      }
      const regularUser = users.find((u) => u.email === 'alex@freelance.io') || INITIAL_USERS[1];
      setCurrentUser(regularUser);
      setActiveView('dashboard');
      return { success: true };
    }

    // 3. Registered Account Lookup
    const matched = users.find((u) => u.email.toLowerCase() === clean);
    if (!matched) {
      // PREVENT WRONG INFO ACCOUNT CREATION!
      return { 
        success: false, 
        message: `Account "${inputIdentifier}" does not exist. Click "Create New Account" to register.` 
      };
    }

    // Verify Password for custom registered account
    if (matched.password && matched.password !== cleanPass) {
      return { success: false, message: 'Incorrect password. Please verify your password.' };
    }

    setCurrentUser(matched);
    if (matched.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('dashboard');
    }
    return { success: true };
  };

  // Sign Up: Intentionally creates a new user account
  const signUp = async (
    email: string, 
    passwordInput: string, 
    fullName: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Email and password are required.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: `An account with ${cleanEmail} already exists. Please sign in.` };
    }

    const newUser: UserProfile = {
      id: generateUUID(),
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0],
      role: 'user',
      password: cleanPass,
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // Save profile to Supabase database if connected
    const client = getLiveSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').upsert([newUser]);
      } catch (e: any) {
        console.warn('Supabase profile registration note:', e.message);
      }
    }

    setActiveView('dashboard');
    return { success: true };
  };

  const signOut = () => {
    setCurrentUser(null);
    setActiveView('login');
  };

  const switchPersona = (email: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setActiveView('admin');
      } else {
        setActiveView('dashboard');
      }
    }
  };

  const createOrUpdateInvoice = async (
    invoiceData: Omit<Invoice, 'id' | 'created_at'> & { id?: string }
  ): Promise<{ success: boolean; invoice: Invoice; message: string }> => {
    const client = getLiveSupabaseClient();
    const isEdit = !!invoiceData.id && invoices.some((i) => i.id === invoiceData.id);
    const invoiceId = invoiceData.id || generateUUID();

    const targetUserId = currentUser?.id || 'b0000000-0000-4000-8000-000000000002';

    const fullInvoice: Invoice = {
      ...invoiceData,
      id: invoiceId,
      user_id: invoiceData.user_id || targetUserId,
      currency: invoiceData.currency || 'USD',
      created_at: isEdit
        ? invoices.find((i) => i.id === invoiceId)?.created_at || new Date().toISOString()
        : new Date().toISOString(),
      created_by_email: currentUser?.email || 'alex@freelance.io',
    };

    // 1. Update state immediately
    if (isEdit) {
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? fullInvoice : inv)));
    } else {
      setInvoices((prev) => [fullInvoice, ...prev]);
    }

    // 2. Persist to Supabase Cloud Database!
    let remoteStatus = 'Saved in database.';
    if (client) {
      try {
        const payload = {
          id: fullInvoice.id,
          user_id: fullInvoice.user_id,
          invoice_number: fullInvoice.invoice_number,
          client_name: fullInvoice.client_name,
          client_email: fullInvoice.client_email,
          client_address: fullInvoice.client_address || '',
          sender_name: fullInvoice.sender_name || '',
          sender_email: fullInvoice.sender_email || '',
          issue_date: fullInvoice.issue_date,
          due_date: fullInvoice.due_date,
          items: fullInvoice.items,
          subtotal: fullInvoice.subtotal,
          tax_percent: fullInvoice.tax_percent,
          tax_amount: fullInvoice.tax_amount,
          discount_percent: fullInvoice.discount_percent,
          discount_amount: fullInvoice.discount_amount,
          total_amount: fullInvoice.total_amount,
          status: fullInvoice.status,
          notes: fullInvoice.notes || '',
        };

        const { error } = await client.from('invoices').upsert(payload);
        if (error) {
          remoteStatus = `Saved locally (Supabase write note: ${error.message}).`;
        } else {
          remoteStatus = '✓ Synced & persisted to Supabase database (Cloud).';
        }
      } catch (err: any) {
        remoteStatus = `Saved locally (Network: ${err.message}).`;
      }
    }

    return {
      success: true,
      invoice: fullInvoice,
      message: `${isEdit ? 'Updated' : 'Created'} invoice ${fullInvoice.invoice_number}. ${remoteStatus}`,
    };
  };

  const updateInvoiceStatus = async (
    id: string,
    status: 'draft' | 'pending' | 'paid' | 'overdue'
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    const client = getLiveSupabaseClient();
    if (client) {
      try {
        await client.from('invoices').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Failed to update remote status:', err);
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    const client = getLiveSupabaseClient();
    if (client) {
      try {
        await client.from('invoices').delete().eq('id', id);
      } catch (err) {
        console.warn('Failed to delete remote invoice:', err);
      }
    }
  };

  const duplicateInvoice = (invoice: Invoice) => {
    const clone: Invoice = {
      ...invoice,
      id: generateUUID(),
      invoice_number: `INV-${1000 + invoices.length + 1}`,
      status: 'pending',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [clone, ...prev]);
    setActiveInvoiceForPrint(clone);
  };

  const createUserAccount = async (
    email: string,
    fullName: string,
    role: 'admin' | 'user'
  ): Promise<{ success: boolean; message: string }> => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: `Account ${email} already exists.` };
    }

    const newUser: UserProfile = {
      id: generateUUID(),
      email,
      full_name: fullName,
      role,
      password: 'password123',
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);

    const client = getLiveSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').upsert([newUser]);
      } catch (e: any) {
        console.warn('Remote profile insert notice:', e.message);
      }
    }

    return {
      success: true,
      message: `Account created for ${fullName} (${email}) as ${role.toUpperCase()}.`,
    };
  };

  const seedDemoDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const client = getLiveSupabaseClient();
    if (!client) {
      return { success: false, message: 'No live Supabase project configured. Please set your URL and Anon Key first.' };
    }

    try {
      // Seed profiles
      const { error: pErr } = await client.from('profiles').upsert(INITIAL_USERS);
      if (pErr) throw new Error('Profiles table seed failed: ' + pErr.message);

      // Seed invoices
      const invoicePayloads = INITIAL_INVOICES.map((inv) => ({
        id: inv.id,
        user_id: inv.user_id,
        invoice_number: inv.invoice_number,
        client_name: inv.client_name,
        client_email: inv.client_email,
        client_address: inv.client_address || '',
        sender_name: inv.sender_name || '',
        sender_email: inv.sender_email || '',
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        items: inv.items,
        subtotal: inv.subtotal,
        tax_percent: inv.tax_percent,
        tax_amount: inv.tax_amount,
        discount_percent: inv.discount_percent,
        discount_amount: inv.discount_amount,
        total_amount: inv.total_amount,
        status: inv.status,
        notes: inv.notes || '',
      }));

      const { error: iErr } = await client.from('invoices').upsert(invoicePayloads);
      if (iErr) throw new Error('Invoices table seed failed: ' + iErr.message);

      await runDiagnostics();
      await syncWithSupabase();

      return {
        success: true,
        message: 'Successfully populated Supabase database with profiles and itemized invoices!',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Seeding failed' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        invoices,
        activeView,
        setActiveView,
        signIn,
        signUp,
        signOut,
        switchPersona,
        createOrUpdateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        duplicateInvoice,
        editingInvoice,
        setEditingInvoice,
        createUserAccount,
        activeInvoiceForPrint,
        setActiveInvoiceForPrint,
        diagnostics,
        isDiagnosticsLoading,
        runDiagnostics,
        syncWithSupabase,
        seedDemoDataToSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
