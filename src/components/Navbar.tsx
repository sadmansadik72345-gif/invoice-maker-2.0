import React from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, LogOut, Shield, Code, Settings } from 'lucide-react';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const { 
    currentUser, 
    activeView, 
    setActiveView, 
    signOut 
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
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

        {/* Zone 2: Clean User Navigation (Unwanted options removed!) */}
        <nav className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Invoices
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
        </nav>

        {/* Zone 3: Account & Session */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                </div>
              </div>

              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
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
