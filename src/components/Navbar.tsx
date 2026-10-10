import React from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, LogOut, Code, Database, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const { currentUser, activeView, setActiveView, signOut, isLiveSupabaseConnected } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => setActiveView(currentUser?.role === 'admin' ? 'admin' : 'dashboard')}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            InvoicePulse
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {currentUser && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          )}

          <button
            onClick={() => setActiveView('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeView === 'code'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Next.js 14 Code
          </button>

          <button
            onClick={() => setActiveView('schema')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeView === 'schema'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase Schema
          </button>
        </nav>

        {/* Zone 3: Primary Action / User */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenConfig}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Configure Supabase Credentials"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="hidden sm:inline">{isLiveSupabaseConnected ? 'Supabase Live' : 'Database Ready'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Standard User'}
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveView('login')}
              className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
