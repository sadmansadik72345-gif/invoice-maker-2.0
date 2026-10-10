import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, Mail, Lock, ArrowRight, User, Shield, KeyRound, AlertCircle, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, signUp } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Fields (Default to admin credentials for quick convenience)
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    if (activeTab === 'signin') {
      const result = signIn(identifier, password);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMessage(result.message || 'Invalid credentials.');
      }
    } else {
      if (!fullName.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your full name to create an account.');
        return;
      }
      const result = await signUp(identifier, password, fullName);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMessage(result.message || 'Unable to register account.');
      }
    }
  };

  const handleFillCredentials = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-xs">
          <Receipt className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          InvoicePulse
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Next.js 14 & Supabase Invoice Maker
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-2xl sm:px-10 shadow-xs space-y-6">
          
          {/* Credentials Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                <span>Verified Credentials</span>
              </span>
            </div>

            {/* Admin Credentials */}
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-700" />
                  Admin Account
                </span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin', 'admin123')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Auto Fill Admin
                </button>
              </div>
              <div className="font-mono text-[11px] text-purple-950 space-y-0.5">
                <div><span className="text-purple-600">Username:</span> <strong className="select-all">admin</strong> (or admin@invoicepulse.dev)</div>
                <div><span className="text-purple-600">Password:</span> <strong className="select-all">admin123</strong></div>
              </div>
            </div>

            {/* Standard User Credentials */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  Standard User
                </span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('alex@freelance.io', 'password123')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded transition-colors"
                >
                  Auto Fill User
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                <div><span className="text-slate-400">Username:</span> <strong className="select-all">alex@freelance.io</strong> (or user)</div>
                <div><span className="text-slate-400">Password:</span> <strong className="select-all">password123</strong></div>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setIdentifier('admin');
                setPassword('admin123');
                setErrorMessage(null);
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
                setIdentifier('');
                setPassword('');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arthur Vance"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="admin or user@domain.com"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              <span>
                {isSubmitting
                  ? 'Verifying...'
                  : activeTab === 'signin'
                  ? 'Sign In'
                  : 'Create Free Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
