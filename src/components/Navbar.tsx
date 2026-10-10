import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Receipt, LogOut, Code, Database, Shield, ChevronDown, 
  Check, User, Sparkles, RefreshCw 
} from 'lucide-react';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const { 
    currentUser, 
    users, 
    activeView, 
    setActiveView, 
    signOut, 
    switchPersona, 
    diagnostics, 
    isDiagnosticsLoading, 
    runDiagnostics 
  } = useApp();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const isConnected = diagnostics?.connected && (diagnostics?.hasInvoicesTable || diagnostics?.hasProfilesTable);

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

        {/* Zone 3: Primary Action / DB Health & User Persona */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Database Health Pill */}
          <button
            onClick={onOpenConfig}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isConnected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Inspect Database Health & Connection"
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400'
              }`} 
            />
            <span className="hidden sm:inline font-medium">
              {isConnected ? 'Supabase Live' : 'Database Analyst'}
            </span>
          </button>

          {/* User Persona Switcher (Solves the switching design loop) */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">
                  {currentUser.role === 'admin' ? 'A' : 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {currentUser.role === 'admin' ? 'Admin' : 'User'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Quick Switch Test Role
                    </span>
                  </div>

                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchPersona(u.email);
                          setIsPersonaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-slate-50/80 font-medium' : ''
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-slate-900 font-semibold truncate flex items-center gap-1.5">
                            {u.role === 'admin' && (
                              <Shield className="w-3 h-3 text-purple-600 shrink-0" />
                            )}
                            <span>{u.full_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                      </button>
                    );
                  })}

                  <div className="pt-1.5 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        signOut();
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
