import React from 'react';
import { Invoice } from '../types';
import { Printer, X, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:max-w-none print:rounded-none">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Invoice Print Preview</span>
            <span className="text-[11px] font-mono text-slate-500">({invoice.invoice_number})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-8 sm:p-12 print:p-0 print-area text-slate-900 bg-white">
          {/* Header row */}
          <div className="flex justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">INVOICE</div>
              <div className="font-mono text-xs font-semibold text-slate-600 mt-1">
                {invoice.invoice_number}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                Status: {invoice.status.toUpperCase()}
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-sm text-slate-900">{invoice.sender_name || 'My Studio'}</div>
              <div className="text-slate-600 font-mono mt-0.5">{invoice.sender_email || 'billing@studio.com'}</div>
              {invoice.sender_address && (
                <div className="text-slate-500 whitespace-pre-line mt-1">{invoice.sender_address}</div>
              )}
            </div>
          </div>

          {/* Billed To & Dates */}
          <div className="grid grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.client_name}</div>
              <div className="text-slate-600 font-mono mt-0.5">{invoice.client_email}</div>
              {invoice.client_address && (
                <div className="text-slate-500 whitespace-pre-line mt-1.5">{invoice.client_address}</div>
              )}
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex justify-end gap-3">
                <span className="text-slate-500">Invoice Date:</span>
                <span className="font-mono font-medium text-slate-900">{invoice.issue_date}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="text-slate-500">Payment Due:</span>
                <span className="font-mono font-medium text-slate-900">{invoice.due_date}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="text-slate-500">Currency:</span>
                <span className="font-mono font-medium text-slate-900">{invoice.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600">
                  <th className="py-2.5 font-semibold">Item & Description</th>
                  <th className="py-2.5 text-right font-semibold w-16">Qty</th>
                  <th className="py-2.5 text-right font-semibold w-24">Price ({invoice.currency || '$'})</th>
                  <th className="py-2.5 text-right font-semibold w-28">Amount ({invoice.currency || '$'})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 font-medium text-slate-900">
                      {item.description || 'Standard Service'}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                      {invoice.currency || '$'} {Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {invoice.currency || '$'} {Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-medium">
                  {invoice.currency || '$'} {Number(invoice.subtotal).toFixed(2)}
                </span>
              </div>

              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount ({invoice.discount_percent}%)</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    -{invoice.currency || '$'} {Number(invoice.discount_amount).toFixed(2)}
                  </span>
                </div>
              )}

              {Number(invoice.tax_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({invoice.tax_percent}%)</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    +{invoice.currency || '$'} {Number(invoice.tax_amount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline font-bold text-sm text-slate-900">
                <span>Total Due</span>
                <span className="font-mono text-base tabular-nums">
                  {invoice.currency || '$'} {Number(invoice.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and instructions */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">
                Payment Instructions & Terms:
              </span>
              <p className="text-slate-500 whitespace-pre-line leading-relaxed">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Generated with InvoicePulse</span>
            <span>Thank you for your business</span>
          </div>
        </div>
      </div>
    </div>
  );
};
