export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  sender_name?: string;
  sender_email?: string;
  sender_address?: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  discount_percent: number;
  discount_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  created_by_email?: string;
}

export interface NextJsFile {
  path: string;
  filename: string;
  category: 'config' | 'supabase' | 'app' | 'middleware' | 'database';
  description: string;
  content: string;
}
