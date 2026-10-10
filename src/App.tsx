import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { AdminPage } from './components/AdminPage';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { SchemaView } from './components/SchemaView';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, activeInvoiceForPrint, setActiveInvoiceForPrint } = useApp();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar onOpenConfig={() => setIsConfigOpen(true)} />

      <main className="flex-1">
        {activeView === 'login' && <LoginPage />}
        {activeView === 'dashboard' && <DashboardPage />}
        {activeView === 'admin' && <AdminPage />}
        {activeView === 'code' && <CodeExplorerModal />}
        {activeView === 'schema' && <SchemaView />}
      </main>

      {/* Footer with clean, unobtrusive secondary tools */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">InvoicePulse</span>
            <span>·</span>
            <span>Simple Next.js 14 & Supabase Invoice Maker</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => setActiveView('code')}
              className="hover:text-slate-900 transition-colors"
            >
              Export Code
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveView('schema')}
              className="hover:text-slate-900 transition-colors"
            >
              SQL Schema
            </button>
            <span>·</span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Database Connection
            </button>
          </div>
        </div>
      </footer>

      {/* Print Overlay / Modal */}
      <InvoicePrintModal
        invoice={activeInvoiceForPrint}
        onClose={() => setActiveInvoiceForPrint(null)}
      />

      {/* Supabase Connection Dialog */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
