export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  paymentMethod?: string;
  accountId?: string;
  receiptUri?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
}

export interface FilterOptions {
  category?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  source: string;
  date: string;
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  balance: number;
  color: string;
  icon: string;
}

export interface ExpenseTemplate {
  id: string;
  name: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod?: string;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  personName: string;
  amount: number;
  isPaid: boolean;
}
