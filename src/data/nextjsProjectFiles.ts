import { NextJsFile } from '../types';

export const NEXTJS_PROJECT_FILES: NextJsFile[] = [
  {
    path: 'package.json',
    filename: 'package.json',
    category: 'config',
    description: 'Next.js 14 project dependencies and scripts for Vercel deployment',
    content: `{
  "name": "simple-invoice-maker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.48.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.546.0",
    "next": "14.2.24",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.17.19",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  }
}`
  },
  {
    path: '.env.local.example',
    filename: '.env.local.example',
    category: 'config',
    description: 'Environment variables for Supabase Auth, DB, and Admin API',
    content: `# Supabase Public Configuration (Exposed to Browser)
NEXT_PUBLIC_SUPABASE_URL=https://icosoivejqnxpexkaijx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljb3NvaXZlanFueHBleGthaWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDI2MDcsImV4cCI6MjEwNzE3ODYwN30.C4JkXbB7tc__q0qgJD7yLbA5KwTimukjx4IK77aJHEA

# Supabase Service Role Key (Keep Secret! Used ONLY in Server Actions / Admin API routes)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# App URL for OAuth Callbacks & Redirections
NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  },
  {
    path: 'middleware.ts',
    filename: 'middleware.ts',
    category: 'middleware',
    description: 'Role-based route protection middleware using @supabase/ssr',
    content: `import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Unauthenticated users trying to access protected routes (/dashboard, /admin)
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Already authenticated users trying to access /login
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Admin-only route protection (/admin)
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // Forbidden: Redirect normal users to standard dashboard
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};`
  },
  {
    path: 'lib/supabase/client.ts',
    filename: 'client.ts',
    category: 'supabase',
    description: 'Browser client instance for client-side React components',
    content: `import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}`
  },
  {
    path: 'lib/supabase/server.ts',
    filename: 'server.ts',
    category: 'supabase',
    description: 'Server client instance for Server Components, Server Actions & Route Handlers',
    content: `import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handled in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handled in middleware
          }
        },
      },
    }
  );
}

// Admin client using service role key (bypasses RLS - use strictly in protected server code!)
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}`
  },
  {
    path: 'app/login/page.tsx',
    filename: 'page.tsx',
    category: 'app',
    description: 'Clean login page with Supabase email/password authentication & error handling',
    content: `'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Receipt, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        setErrorMessage('Account created! Please check your email to confirm or sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check if admin to route intelligently
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'admin' && !searchParams.get('redirectTo')) {
            router.push('/admin');
          } else {
            router.push(redirectTo);
          }
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">InvoicePulse</span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          {isSignUp ? 'Create a new account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Simple, professional invoice generator powered by Next.js & Supabase
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isSignUp ? 'Already have an account?' : 'Need an account?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
              }}
              className="font-semibold text-slate-900 hover:underline"
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'app/dashboard/page.tsx',
    filename: 'page.tsx',
    category: 'app',
    description: 'User Invoice Creator with dynamic line items, auto-calc totals, print mode & Supabase saving',
    content: `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Receipt, Plus, Trash2, Printer, CheckCircle, Clock, 
  FileText, Download, LogOut, Shield, DollarSign
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('INV-1001');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Payment is due within 14 days of issue. Bank Transfer details on request.');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Web Development Services', quantity: 20, unitPrice: 75, total: 1500 },
    { id: '2', description: 'UI/UX Design Consultation', quantity: 5, unitPrice: 90, total: 450 }
  ]);
  const [taxPercent, setTaxPercent] = useState<number>(10);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);

  // Totals calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const grandTotal = taxableAmount + taxAmount;

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);

      // Fetch user invoices
      const { data: invoiceList } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoiceList) {
        setInvoices(invoiceList);
        setInvoiceNumber(\`INV-\${1001 + invoiceList.length}\`);
      }
      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

  // Line item handlers
  function addItem() {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: 'description' | 'quantity' | 'unitPrice', value: any) {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const qty = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const price = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
          updated.total = qty * price;
          return updated;
        }
        return item;
      })
    );
  }

  // Save Invoice to Supabase
  async function handleSaveInvoice(status: 'pending' | 'paid' = 'pending') {
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Please fill in Client Name and Client Email');
      return;
    }
    setIsSaving(true);
    try {
      const invoicePayload = {
        user_id: user.id,
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail,
        client_address: clientAddress,
        sender_name: userProfile?.full_name || user.email,
        sender_email: user.email,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        subtotal,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        total_amount: grandTotal,
        status,
        notes,
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoicePayload])
        .select()
        .single();

      if (error) throw error;

      setInvoices([data, ...invoices]);
      setPreviewInvoice(data);
      alert('Invoice saved successfully to Supabase!');
      setActiveTab('history');
      // Reset form
      setInvoiceNumber(\`INV-\${1001 + invoices.length + 1}\`);
      setClientName('');
      setClientEmail('');
      setClientAddress('');
    } catch (err: any) {
      alert(err.message || 'Error saving invoice');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Loading invoice workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar Contract: Brand - Nav Links - Action */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              InvoicePulse
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={\`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap \${
                activeTab === 'create' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }\`}
            >
              New Invoice
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={\`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap \${
                activeTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }\`}
            >
              Past Invoices (\${invoices.length})
            </button>
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Portal
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">
              \${user?.email} \${userProfile?.role === 'admin' ? '(Admin)' : ''}
            </span>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Invoice Editor Left Column (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Invoice</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in client details and dynamic line items
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-xs text-slate-400 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="font-mono text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg px-3 py-1 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Client & Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bill To</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Client Email *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="billing@acme.com"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Billing Address</label>
                    <textarea
                      rows={2}
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="100 Market St, Suite 400, San Francisco, CA"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice Details</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Issuer / Sender</label>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <div className="font-medium text-slate-900">{userProfile?.full_name || 'My Studio'}</div>
                      <div>{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Line Items Table */}
              <div className="py-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-900 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2 font-medium">Description</th>
                        <th className="py-2 px-3 font-medium text-right w-24">Qty</th>
                        <th className="py-2 px-3 font-medium text-right w-32">Price ($)</th>
                        <th className="py-2 px-3 font-medium text-right w-32">Total ($)</th>
                        <th className="py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 pr-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Service or item description..."
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-full font-mono text-right border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                              className="w-full font-mono text-right border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                            \${item.total.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-6">
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes & Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations & Summary Right Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Summary & Taxes</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums font-medium">\${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-xs">Discount (%)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                        className="w-16 text-right font-mono text-xs border border-slate-200 rounded px-2 py-1"
                      />
                      <span className="font-mono text-xs text-slate-500 tabular-nums">-\${discountAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-xs">Tax Rate (%)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                        className="w-16 text-right font-mono text-xs border border-slate-200 rounded px-2 py-1"
                      />
                      <span className="font-mono text-xs text-slate-500 tabular-nums">+\${taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900">Total Due</span>
                    <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                      \${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveInvoice('pending')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {isSaving ? 'Saving to Supabase...' : 'Save as Pending'}
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveInvoice('paid')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-60 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save as Paid
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewInvoice({
                        invoice_number: invoiceNumber,
                        client_name: clientName || 'Client Name',
                        client_email: clientEmail || 'client@example.com',
                        client_address: clientAddress,
                        sender_name: userProfile?.full_name || 'Your Company',
                        sender_email: user?.email,
                        issue_date: issueDate,
                        due_date: dueDate,
                        items,
                        subtotal,
                        tax_percent: taxPercent,
                        tax_amount: taxAmount,
                        discount_percent: discountPercent,
                        discount_amount: discountAmount,
                        total_amount: grandTotal,
                        status: 'pending',
                        notes,
                      });
                      setTimeout(() => window.print(), 200);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Past Invoices History Table */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Past Invoices</h2>
                <p className="text-xs text-slate-500">Invoices saved to Supabase database</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Invoice
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No invoices generated yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Create your first client invoice using the builder.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Number</th>
                      <th className="py-3 px-4 font-semibold">Client</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{inv.client_name}</div>
                          <div className="text-xs text-slate-500">{inv.client_email}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                          {inv.issue_date}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          \${Number(inv.total_amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium \${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }\`}>
                            {inv.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setPreviewInvoice(inv);
                              setTimeout(() => window.print(), 200);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Print invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CSS Print-friendly overlay (Only renders when printing or previewing) */}
      {previewInvoice && (
        <div id="print-container" className="hidden print:block print:p-8 bg-white text-black font-sans">
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
              <p className="text-sm font-mono mt-1 text-slate-600">{previewInvoice.invoice_number}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold">{previewInvoice.sender_name}</p>
              <p className="text-slate-600">{previewInvoice.sender_email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 my-8 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">BILLED TO</p>
              <p className="font-bold text-base mt-1">{previewInvoice.client_name}</p>
              <p className="text-slate-600">{previewInvoice.client_email}</p>
              {previewInvoice.client_address && (
                <p className="text-slate-600 whitespace-pre-line mt-1">{previewInvoice.client_address}</p>
              )}
            </div>
            <div className="text-right">
              <p><span className="text-slate-500">Date:</span> {previewInvoice.issue_date}</p>
              <p><span className="text-slate-500">Due Date:</span> {previewInvoice.due_date}</p>
              <p><span className="text-slate-500">Status:</span> {previewInvoice.status.toUpperCase()}</p>
            </div>
          </div>

          <table className="w-full text-left my-8 text-sm border-t border-b border-slate-300">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {previewInvoice.items?.map((it: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right font-mono">{it.quantity}</td>
                  <td className="py-2 text-right font-mono">\${Number(it.unitPrice).toFixed(2)}</td>
                  <td className="py-2 text-right font-mono font-medium">\${Number(it.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">\${Number(previewInvoice.subtotal).toFixed(2)}</span>
              </div>
              {Number(previewInvoice.discount_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-mono">-\${Number(previewInvoice.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {Number(previewInvoice.tax_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({previewInvoice.tax_percent}%)</span>
                  <span className="font-mono">+\${Number(previewInvoice.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-900 pt-2 font-bold text-base">
                <span>Total Due</span>
                <span className="font-mono">\${Number(previewInvoice.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {previewInvoice.notes && (
            <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Notes & Payment Instructions:</p>
              <p>{previewInvoice.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`
  },
  {
    path: 'app/admin/page.tsx',
    filename: 'page.tsx',
    category: 'app',
    description: 'Admin Dashboard: Restricted to profiles.role == "admin", Admin User Creator & Global Overview',
    content: `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Shield, UserPlus, Users, DollarSign, FileText, CheckCircle, 
  Clock, ArrowLeft, AlertCircle, Check 
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // User Creator Form State
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createStatus, setCreateStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function verifyAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert('Access denied: You must be an administrator to view this portal.');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Fetch all invoices across all users
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('*, profiles:user_id(email, full_name)')
        .order('created_at', { ascending: false });

      if (allInvoices) setInvoices(allInvoices);

      // Fetch all user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) setUsersList(profiles);

      setIsLoading(false);
    }

    verifyAdminAndFetch();
  }, [router, supabase]);

  // Handle Admin User Creation via Route Handler or Supabase
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingUser(true);
    setCreateStatus(null);

    try {
      // Call secure server-side admin API route (/api/admin/create-user)
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          fullName: newFullName,
          role: newRole,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create user account');
      }

      setCreateStatus({
        type: 'success',
        message: \`User \${newEmail} (\${newRole}) successfully created!\`,
      });

      // Clear form
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');

      // Refresh profiles list
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profiles) setUsersList(profiles);
    } catch (err: any) {
      setCreateStatus({
        type: 'error',
        message: err.message || 'Error creating user',
      });
    } finally {
      setIsCreatingUser(false);
    }
  }

  // Calculate Metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Verifying administrator privileges...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Return to User Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <Shield className="w-4 h-4" />
              </span>
              <span className="font-bold tracking-tight text-slate-900">
                Administration Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Role: Super Admin</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              User View
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Global KPI Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Total Collected Revenue</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
              \${totalRevenue.toFixed(2)}
            </div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">Paid invoices across users</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Pending Outstanding</span>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-600 tabular-nums">
              \${pendingRevenue.toFixed(2)}
            </div>
            <span className="text-xs text-amber-600 mt-1 inline-block">Awaiting client payment</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Total Invoices Created</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {invoices.length}
            </div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Across all registered accounts</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Registered Users</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {usersList.length}
            </div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Managed accounts</span>
          </div>
        </div>

        {/* 2-Column Split: Admin User Creator & Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admin User Creator Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-slate-900" />
              <h2 className="text-base font-bold text-slate-900">Create New User Account</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Provision standard user or admin credentials directly via Supabase Auth API
            </p>

            {createStatus && (
              <div className={\`p-3.5 rounded-lg mb-5 text-xs flex items-center gap-2.5 \${
                createStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }\`}>
                {createStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{createStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sarah@agency.com"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="user">Standard User (Invoices only)</option>
                  <option value="admin">Administrator (Full admin access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreatingUser}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isCreatingUser ? 'Creating user in Supabase...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* User Directory (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">User Directory</h2>
              <p className="text-xs text-slate-500">Profiles stored in public.profiles table</p>
            </div>
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">User</th>
                    <th className="py-2.5 px-4 font-semibold">Role</th>
                    <th className="py-2.5 px-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{u.full_name || 'No Name'}</div>
                        <div className="text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={\`inline-block px-2 py-0.5 rounded text-[11px] font-medium \${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }\`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Invoice Overview Across All Users */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Global Invoices Log</h2>
            <p className="text-xs text-slate-500">All invoices generated across every registered user account</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Creator Account</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No invoices found across the platform.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-medium text-slate-800">
                          {inv.sender_name || inv.profiles?.full_name || 'User'}
                        </span>
                        <div className="text-slate-400 font-mono">{inv.sender_email || inv.profiles?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{inv.client_name}</div>
                        <div className="text-xs text-slate-500">{inv.client_email}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        \${Number(inv.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium \${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }\`}>
                          {inv.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500 font-mono">
                        {inv.issue_date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}`
  },
  {
    path: 'app/api/admin/create-user/route.ts',
    filename: 'route.ts',
    category: 'app',
    description: 'Next.js App Router API Route for secure Admin user creation via Supabase Service Role',
    content: `import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 1. Authenticate caller and verify admin status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { email, password, fullName, role = 'user' } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 3. Use Supabase Admin Client (Service Role) to create auth user
    const adminClient = createAdminClient();
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 4. Update or insert into public.profiles with specified role
    if (newUser.user) {
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email,
          full_name: fullName,
          role: role,
        });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
        role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}`
  },
  {
    path: 'supabase/schema.sql',
    filename: 'schema.sql',
    category: 'database',
    description: 'PostgreSQL database schema, profiles table, invoices table, RLS policies & triggers',
    content: `-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (Role-based access: 'admin' or 'user')
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address TEXT,
  sender_name TEXT,
  sender_email TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Security Definer Helper: Prevents PostgreSQL RLS Infinite Recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 6. Profiles Policies (Clean & Non-Recursive):
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles (via security definer helper)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 7. Invoices Policies:
-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view ALL invoices across users
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (public.is_admin());

-- Users can insert their own invoices
CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own invoices
CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any invoice
CREATE POLICY "Admins can update any invoice"
  ON public.invoices FOR UPDATE
  USING (public.is_admin());

-- Users can delete their own invoices
CREATE POLICY "Users can delete own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any invoice
CREATE POLICY "Admins can delete any invoice"
  ON public.invoices FOR DELETE
  USING (public.is_admin());

-- 7. Trigger to automatically create a profile row upon Supabase Auth sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed the initial Admin user profile (Replace with your actual admin user ID if known)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';`
  },
  {
    path: 'app/layout.tsx',
    filename: 'layout.tsx',
    category: 'app',
    description: 'Next.js 14 Root layout with metadata and Inter/Plus Jakarta fonts',
    content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InvoicePulse - Simple Invoice Maker',
  description: 'Fast, professional invoice maker powered by Next.js 14, Supabase, and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}`
  }
];
