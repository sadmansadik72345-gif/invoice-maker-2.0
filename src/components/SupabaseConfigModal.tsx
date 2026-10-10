import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { Database, Key, Check, X, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isLiveSupabaseConnected, refreshLiveDb } = useApp();
  const initial = getStoredSupabaseConfig();
  const [url, setUrl] = useState(initial.url);
  const [anonKey, setAnonKey] = useState(initial.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMessage(null);

    saveStoredSupabaseConfig(url, anonKey);
    await refreshLiveDb();
    setIsTesting(false);
    setStatusMessage('Settings saved. Ready to synchronize with Supabase backend.');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleClear = async () => {
    saveStoredSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    await refreshLiveDb();
    setStatusMessage('Cleared credentials. Reverted to built-in simulated storage.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase Connection Settings</h3>
              <p className="text-[11px] text-slate-500">Connect to your Supabase project instance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Instant Live Preview:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The application works out-of-the-box with local state and pre-seeded Admin/User personas. If you provide your project URL & Anon key, it will also sync with your live Supabase project!
            </p>
          </div>

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Project URL (<code className="font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Anon Key (<code className="font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
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
              onClick={handleClear}
              className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 transition-colors"
            >
              Reset to Local Mode
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs"
              >
                {isTesting ? 'Connecting...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
