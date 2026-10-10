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
  const { activeView, activeInvoiceForPrint, setActiveInvoiceForPrint } = useApp();
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

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">InvoicePulse</span>
            <span>·</span>
            <span>Next.js 14 + Supabase + Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Role-Based Auth (Admin & User)</span>
            <span>·</span>
            <span>PostgreSQL RLS Protected</span>
            <span>·</span>
            <span>Vercel Ready</span>
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
