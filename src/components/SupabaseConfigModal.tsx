import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { 
  Database, Key, Check, X, ExternalLink, RefreshCw, 
  AlertCircle, ShieldCheck, CheckCircle2, Table, Sparkles 
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { 
    diagnostics, 
    isDiagnosticsLoading, 
    runDiagnostics, 
    syncWithSupabase, 
    seedDemoDataToSupabase 
  } = useApp();

  const initial = getStoredSupabaseConfig();
  const [url, setUrl] = useState(initial.url);
  const [anonKey, setAnonKey] = useState(initial.anonKey);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus(null);
    saveStoredSupabaseConfig(url, anonKey);
    const result = await runDiagnostics();
    if (result.connected && (result.hasInvoicesTable || result.hasProfilesTable)) {
      setActionStatus({
        type: 'success',
        message: 'Successfully connected to Supabase and verified tables!',
      });
      await syncWithSupabase();
    } else if (result.connected) {
      setActionStatus({
        type: 'error',
        message: 'Supabase URL reachable, but tables not found. Run the SQL schema from the "Supabase Schema" tab.',
      });
    } else {
      setActionStatus({
        type: 'error',
        message: result.errorDetail || result.message,
      });
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setActionStatus(null);
    const result = await seedDemoDataToSupabase();
    setIsSeeding(false);
    setActionStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleResetToLocal = async () => {
    saveStoredSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    await runDiagnostics();
    setActionStatus({
      type: 'success',
      message: 'Reverted to built-in simulated in-memory storage.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Analyst & Supabase Connection</h3>
              <p className="text-[11px] text-slate-500">Live connection diagnostics, health probe & table sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Health Status */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Database Diagnostic Health
              </span>
              <button
                type="button"
                onClick={() => runDiagnostics()}
                disabled={isDiagnosticsLoading}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isDiagnosticsLoading ? 'animate-spin' : ''}`} />
                <span>Probe Database</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Connection State</span>
                <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    diagnostics?.connected ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <span>{diagnostics?.connected ? 'Connected' : 'Local Simulated'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Tables Verified</span>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {diagnostics?.hasInvoicesTable && diagnostics?.hasProfilesTable
                    ? 'profiles & invoices OK'
                    : diagnostics?.connected
                    ? 'Pending schema run'
                    : 'Simulated Storage'}
                </div>
              </div>
            </div>

            {diagnostics?.errorDetail && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <span className="font-semibold block mb-0.5">Diagnostic Finding:</span>
                {diagnostics.errorDetail}
              </div>
            )}
          </div>

          {actionStatus && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              actionStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {actionStatus.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{actionStatus.message}</span>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Supabase Project URL (<code className="font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code>)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourprojectid.supabase.co"
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Anon Public Key (<code className="font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
              </label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetToLocal}
                className="text-xs text-slate-500 hover:text-red-600 transition-colors"
              >
                Reset to Local Mode
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isDiagnosticsLoading}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs"
                >
                  {isDiagnosticsLoading ? 'Testing...' : 'Save & Verify Connection'}
                </button>
              </div>
            </div>
          </form>

          {/* Seed to Live Supabase Tool */}
          {url && anonKey && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Populate Sample Database</span>
                <span className="text-[11px] text-slate-500">Seed sample profiles & invoices directly to Supabase</span>
              </div>
              <button
                type="button"
                onClick={handleSeedData}
                disabled={isSeeding}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-60 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Seeding...' : 'Seed Supabase'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
