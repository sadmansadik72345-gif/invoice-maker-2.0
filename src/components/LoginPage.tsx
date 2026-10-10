import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, Mail, Lock, ArrowRight, User, Shield, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Fields
  const [email, setEmail] = useState('alex@freelance.io');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (activeTab === 'signup' && !fullName.trim()) {
      setFeedback('Please provide your full name');
      return;
    }

    signIn(email, 'user');
  };

  const handleQuickDemo = (demoEmail: string, demoRole: 'admin' | 'user') => {
    signIn(demoEmail, demoRole);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-xs">
          <Receipt className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          InvoicePulse
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Simple, professional invoice generator
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-2xl sm:px-10 shadow-xs space-y-6">
          {/* 1-Click Instant Demo Login (Zero friction for testing) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('alex@freelance.io', 'user')}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Demo User</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@invoicepulse.dev', 'admin')}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-purple-600 hover:bg-purple-50 text-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin View</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 shrink-0">
              or use email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Simple Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setEmail('alex@freelance.io');
                setFeedback(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setEmail('');
                setFeedback(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {feedback && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
              {feedback}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{activeTab === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
