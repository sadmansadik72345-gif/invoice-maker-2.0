import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Invoice, InvoiceItem } from '../types';
import { getLiveSupabaseClient } from '../lib/supabaseClient';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  invoices: Invoice[];
  activeView: 'dashboard' | 'admin' | 'login' | 'code' | 'schema';
  setActiveView: (view: 'dashboard' | 'admin' | 'login' | 'code' | 'schema') => void;
  signIn: (email: string, role?: 'admin' | 'user') => boolean;
  signOut: () => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => Invoice;
  updateInvoiceStatus: (id: string, status: 'draft' | 'pending' | 'paid' | 'overdue') => void;
  deleteInvoice: (id: string) => void;
  createUserAccount: (email: string, fullName: string, role: 'admin' | 'user') => boolean;
  activeInvoiceForPrint: Invoice | null;
  setActiveInvoiceForPrint: (inv: Invoice | null) => void;
  isLiveSupabaseConnected: boolean;
  refreshLiveDb: () => Promise<void>;
}

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@invoicepulse.dev',
    full_name: 'Arthur Vance',
    role: 'admin',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_regular_01',
    email: 'alex@freelance.io',
    full_name: 'Alex Rivera',
    role: 'user',
    created_at: '2026-02-10T11:20:00Z',
  },
  {
    id: 'usr_regular_02',
    email: 'elena@designcraft.co',
    full_name: 'Elena Rostova',
    role: 'user',
    created_at: '2026-03-01T14:45:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    user_id: 'usr_regular_01',
    invoice_number: 'INV-1001',
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
    id: 'inv_002',
    user_id: 'usr_regular_01',
    invoice_number: 'INV-1002',
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
    id: 'inv_003',
    user_id: 'usr_regular_02',
    invoice_number: 'INV-1003',
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
    // Default to Alex Rivera (regular user) or restore from localStorage
    const saved = localStorage.getItem('invoicepulse_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[1]; // Alex Rivera (Regular User)
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('invoicepulse_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
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
  const [isLiveSupabaseConnected, setIsLiveSupabaseConnected] = useState(false);

  // Sync to local storage
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

  // Check live Supabase
  const refreshLiveDb = async () => {
    const client = getLiveSupabaseClient();
    if (!client) {
      setIsLiveSupabaseConnected(false);
      return;
    }
    try {
      const { data, error } = await client.from('invoices').select('*').limit(5);
      if (!error) {
        setIsLiveSupabaseConnected(true);
      } else {
        setIsLiveSupabaseConnected(false);
      }
    } catch {
      setIsLiveSupabaseConnected(false);
    }
  };

  useEffect(() => {
    refreshLiveDb();
  }, []);

  const signIn = (email: string, roleOverride?: 'admin' | 'user') => {
    let matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      // Auto-create for demo ease
      matched = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: roleOverride || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [matched!, ...prev]);
    }
    setCurrentUser(matched);
    if (matched.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('dashboard');
    }
    return true;
  };

  const signOut = () => {
    setCurrentUser(null);
    setActiveView('login');
  };

  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by_email: currentUser?.email,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // If live Supabase client exists, attempt background write
    const client = getLiveSupabaseClient();
    if (client) {
      client.from('invoices').insert([newInvoice]).then(({ error }) => {
        if (error) console.warn('Supabase sync notice:', error.message);
      });
    }

    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: 'draft' | 'pending' | 'paid' | 'overdue') => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    const client = getLiveSupabaseClient();
    if (client) {
      client.from('invoices').update({ status }).eq('id', id).then();
    }
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    const client = getLiveSupabaseClient();
    if (client) {
      client.from('invoices').delete().eq('id', id).then();
    }
  };

  const createUserAccount = (email: string, fullName: string, role: 'admin' | 'user'): boolean => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return false;
    }
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    return true;
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
        signOut,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        createUserAccount,
        activeInvoiceForPrint,
        setActiveInvoiceForPrint,
        isLiveSupabaseConnected,
        refreshLiveDb,
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
