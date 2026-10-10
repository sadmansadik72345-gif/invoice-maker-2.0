import React, { useState } from 'react';
import { NEXTJS_PROJECT_FILES } from '../data/nextjsProjectFiles';
import { Database, Copy, Check, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const SchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sqlFile = NEXTJS_PROJECT_FILES.find((f) => f.filename === 'schema.sql');

  const handleCopy = () => {
    if (!sqlFile) return;
    navigator.clipboard.writeText(sqlFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-900 text-emerald-200">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Supabase SQL Schema & RLS Security Policies
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production PostgreSQL script with profiles, invoices, JSONB items, triggers, and Row Level Security
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'SQL Copied to Clipboard!' : 'Copy SQL Migration Script'}</span>
        </button>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-Based RLS Policies</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Normal users can only SELECT and INSERT their own invoices (<code className="font-mono text-[11px]">auth.uid() = user_id</code>), whereas Admins can query and manage all invoices.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Automatic Profile Sync Trigger</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Postgres trigger automatically captures new registrations in <code className="font-mono text-[11px]">auth.users</code> and writes their profile into <code className="font-mono text-[11px]">public.profiles</code>.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Dynamic Line Items JSONB</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Line items are stored in flexible JSONB with validated subtotal, tax amount, and total calculations for fast querying and print formatting.
          </p>
        </div>
      </div>

      {/* SQL Code Block */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>supabase/schema.sql</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>

        <div className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <pre>{sqlFile?.content}</pre>
        </div>
      </div>
    </div>
  );
};
