import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, Mail, Lock, ArrowRight, Shield, User, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, users } = useApp();
  const [email, setEmail] = useState('alex@freelance.io');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    signIn(email, role);
  };

  const handleQuickLogin = (demoEmail: string, demoRole: 'admin' | 'user') => {
    setEmail(demoEmail);
    setPassword('demo-session-ready');
    signIn(demoEmail, demoRole);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">InvoicePulse</span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          {isSignUp ? 'Create your billing account' : 'Sign in to InvoicePulse'}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Production Next.js 14 & Supabase Simple Invoice Maker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-2xl sm:px-10 shadow-xs">
          {/* Quick Demo Selector */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Quick Test Personas (One-Click)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@invoicepulse.dev', 'admin')}
                className="flex items-center gap-2 p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
              >
                <div className="p-1 rounded bg-purple-100 text-purple-700">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Admin Account</div>
                  <div className="text-[10px] text-slate-500">Access /admin & /dashboard</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@freelance.io', 'user')}
                className="flex items-center gap-2 p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
              >
                <div className="p-1 rounded bg-blue-100 text-blue-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Standard User</div>
                  <div className="text-[10px] text-slate-500">Invoice Creator (/dashboard)</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@freelance.io"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{isSignUp ? 'Create Supabase Account' : 'Sign In with Supabase Auth'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isSignUp ? 'Already have credentials?' : 'Need a separate test profile?'}</span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-slate-900 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Register new'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
