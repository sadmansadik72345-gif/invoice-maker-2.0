import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, UserPlus, Users, DollarSign, FileText, CheckCircle, 
  Clock, ArrowLeft, AlertCircle, Check, Search, Lock, UserCheck
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { 
    currentUser, 
    users, 
    invoices, 
    createUserAccount, 
    updateInvoiceStatus, 
    setActiveView, 
    setActiveInvoiceForPrint 
  } = useApp();

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('tempPass#2026');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invoices filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Role-based protection check: Normal Users vs Admins
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Route: Admin Only</h2>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          This portal is protected by Supabase RLS and Next.js middleware. It requires{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-800">
            profiles.role === 'admin'
          </code>.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Return to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle Admin User Creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName) return;
    setIsSubmitting(true);
    setFeedback(null);

    const success = createUserAccount(newEmail, newFullName, newRole);
    setIsSubmitting(false);

    if (success) {
      setFeedback({
        type: 'success',
        message: `User account for ${newEmail} (${newRole}) was created successfully.`,
      });
      setNewEmail('');
      setNewFullName('');
    } else {
      setFeedback({
        type: 'error',
        message: `A user with email ${newEmail} already exists in Supabase Auth.`,
      });
    }
  };

  // Metrics
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.total_amount), 0);

  const pendingRevenue = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + Number(i.total_amount), 0);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.created_by_email && inv.created_by_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Admin Control Console
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-protected administrative panel: User provisioning & global invoice ledger
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Switch to User View
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Paid Revenue</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Across all tenant accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Outstanding Pending</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 tabular-nums">
            ${pendingRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">
            Awaiting client settlement
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Global Invoices</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {invoices.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Total invoices generated
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Managed User Accounts</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {users.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
            In profiles table
          </span>
        </div>
      </div>

      {/* 2-Column Split: User Creator & User Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: Admin User Creator (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900">Provision User Account</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Admin API / Edge function endpoint for adding users with assigned roles
          </p>

          {feedback && (
            <div
              className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="marcus@vancestudio.com"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Temporary Password</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role Permission</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="user">Standard User (Invoice creator only)</option>
                <option value="admin">Administrator (Global view & user provisioning)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create User Account</span>
            </button>
          </form>
        </div>

        {/* Directory Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registered Users Directory</h2>
              <p className="text-xs text-slate-500">Profiles stored in Supabase profiles table</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {users.length} accounts
            </span>
          </div>

          <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">User</th>
                  <th className="py-2.5 px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const count = invoices.filter((i) => i.user_id === u.id || i.created_by_email === u.email).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {count} invoices
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Global Invoices Table Across All Users */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Global Invoices Log (All Tenants)
            </h2>
            <p className="text-xs text-slate-500">
              Full cross-tenant audit ledger accessible only to users with role = 'admin'
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by invoice #, client, creator..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Creator Account</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold text-right">Items</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{inv.sender_name || 'Account'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {inv.created_by_email || inv.sender_email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{inv.client_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{inv.client_email}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                    {inv.items?.length || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${Number(inv.total_amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        updateInvoiceStatus(inv.id, inv.status === 'paid' ? 'pending' : 'paid')
                      }
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Admin override status"
                    >
                      {inv.status === 'paid' ? 'Paid' : 'Pending'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveInvoiceForPrint(inv)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Inspect and Print"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
