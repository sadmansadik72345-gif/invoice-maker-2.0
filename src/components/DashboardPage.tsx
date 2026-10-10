import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InvoiceItem, Invoice, InvoiceStatus } from '../types';
import { 
  Plus, Trash2, Printer, CheckCircle, Clock, FileText, 
  Search, AlertCircle, ArrowUpRight, Copy, Check
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    currentUser, 
    invoices, 
    createInvoice, 
    updateInvoiceStatus, 
    deleteInvoice, 
    setActiveInvoiceForPrint 
  } = useApp();

  // Tab: 'create' | 'history'
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${1000 + invoices.length + 1}`);
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientEmail, setClientEmail] = useState('accounting@acme.com');
  const [clientAddress, setClientAddress] = useState('100 Montgomery St, Suite 500\nSan Francisco, CA 94104');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Payment is due within 14 days of invoice date. Thank you for your business!');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Web Application Development (Sprint 1)', quantity: 40, unitPrice: 85, total: 3400 },
    { id: '2', description: 'Database Schema Design & Migration', quantity: 8, unitPrice: 110, total: 880 },
    { id: '3', description: 'Automated CI/CD Deployment Config', quantity: 4, unitPrice: 125, total: 500 },
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(8.5);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Handlers for dynamic line items
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: 'description' | 'quantity' | 'unitPrice',
    val: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          const qty = field === 'quantity' ? Number(val) || 0 : item.quantity;
          const price = field === 'unitPrice' ? Number(val) || 0 : item.unitPrice;
          updated.total = Math.round(qty * price * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveInvoice = (status: InvoiceStatus = 'pending') => {
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Please provide a Client Name and Client Email.');
      return;
    }

    if (items.some((i) => !i.description.trim() || i.quantity <= 0)) {
      alert('Please ensure all line items have a valid description and quantity.');
      return;
    }

    const created = createInvoice({
      user_id: currentUser?.id || 'usr_guest',
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      client_address: clientAddress,
      sender_name: currentUser?.full_name || 'My Studio',
      sender_email: currentUser?.email || 'billing@mystudio.com',
      sender_address: '780 Market Street, San Francisco, CA',
      issue_date: issueDate,
      due_date: dueDate,
      items,
      subtotal,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      total_amount: grandTotal,
      status,
      notes,
    });

    setNotification(`Invoice ${created.invoice_number} saved successfully!`);
    setTimeout(() => setNotification(null), 4000);

    // Switch to history or prepare next invoice
    setActiveTab('history');
    setInvoiceNumber(`INV-${1000 + invoices.length + 2}`);
  };

  // Filter user's invoices (or all if admin viewing dashboard)
  const userInvoices = invoices.filter(
    (inv) => currentUser?.role === 'admin' || inv.user_id === currentUser?.id || !inv.user_id
  );

  const filteredInvoices = userInvoices.filter((inv) => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, calculate, print, and save client invoices directly to Supabase
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Invoice
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Invoices ({userInvoices.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab 1: Create Invoice */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editor Form (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  New Invoice Draft
                </span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  General Billing Information
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium">Invoice #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-32 font-mono text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Client & Sender Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Bill To (Client)
                </span>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="billing@acme.com"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Billing Address</label>
                  <textarea
                    rows={2}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Street, City, State, ZIP"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Terms & Dates
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sender Profile</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <div className="font-semibold text-slate-900">
                      {currentUser?.full_name || 'Alex Rivera Consulting'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {currentUser?.email || 'alex@freelance.io'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Line Items Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dynamic Line Items
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automatic subtotal and line-by-line price calculation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 font-medium">Description / Service</th>
                      <th className="py-2.5 px-3 font-medium text-right w-24">Qty</th>
                      <th className="py-2.5 px-3 font-medium text-right w-32">Price ($)</th>
                      <th className="py-2.5 px-3 font-medium text-right w-32">Total ($)</th>
                      <th className="py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            placeholder="Consulting, design, engineering item..."
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                            className="w-full font-mono text-right border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full font-mono text-right border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notes & Bank Transfer Terms
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment due within 14 days..."
                className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Pricing & Action Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Total Calculation</h3>
                <p className="text-[11px] text-slate-500">Live ledger tax and discount breakdown</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount (%)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                      className="w-14 text-right font-mono text-xs border border-slate-200 rounded px-1.5 py-1"
                    />
                    <span className="font-mono text-xs text-slate-500 tabular-nums w-16 text-right">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax Rate (%)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                      className="w-14 text-right font-mono text-xs border border-slate-200 rounded px-1.5 py-1"
                    />
                    <span className="font-mono text-xs text-slate-500 tabular-nums w-16 text-right">
                      +${taxAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Grand Total</span>
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSaveInvoice('pending')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Save as Pending to Supabase
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveInvoice('paid')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Save as Paid Directly
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveInvoiceForPrint({
                      id: 'draft',
                      user_id: currentUser?.id || 'usr_guest',
                      invoice_number: invoiceNumber,
                      client_name: clientName,
                      client_email: clientEmail,
                      client_address: clientAddress,
                      sender_name: currentUser?.full_name || 'My Studio',
                      sender_email: currentUser?.email || 'billing@mystudio.com',
                      sender_address: '780 Market Street, San Francisco, CA',
                      issue_date: issueDate,
                      due_date: dueDate,
                      items,
                      subtotal,
                      tax_percent: taxPercent,
                      tax_amount: taxAmount,
                      discount_percent: discountPercent,
                      discount_amount: discountAmount,
                      total_amount: grandTotal,
                      status: 'pending',
                      notes,
                      created_at: new Date().toISOString(),
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Preview & Print Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Past Invoices History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
              {(['all', 'pending', 'paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All Invoices' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search number or client..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Table */}
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700">No matching invoices found</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white"
              >
                Create New Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Dates</th>
                    <th className="py-3 px-4 font-semibold text-right">Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inv.client_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inv.client_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        <div>Issued: {inv.issue_date}</div>
                        <div className="text-slate-400">Due: {inv.due_date}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {inv.items?.length || 0} items
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${Number(inv.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            updateInvoiceStatus(inv.id, inv.status === 'paid' ? 'pending' : 'paid')
                          }
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {inv.status === 'paid' ? 'Paid' : 'Pending'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveInvoiceForPrint(inv)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Print / View Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoice_number}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
