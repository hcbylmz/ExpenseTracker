import * as SQLite from 'expo-sqlite';
import { Expense, Budget, RecurringExpense, FilterOptions, Income, Account, ExpenseTemplate, ExpenseSplit, CustomCategory } from '../types';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('expenses.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        payment_method TEXT,
        account_id TEXT,
        receipt_uri TEXT,
        tags TEXT
      );
      
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        UNIQUE(category, month, year)
      );
      
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        next_due_date TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS custom_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        source TEXT NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT
      );
      
      CREATE TABLE IF NOT EXISTS expense_templates (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        payment_method TEXT
      );
      
      CREATE TABLE IF NOT EXISTS expense_splits (
        id TEXT PRIMARY KEY NOT NULL,
        expense_id TEXT NOT NULL,
        person_name TEXT NOT NULL,
        amount REAL NOT NULL,
        is_paid INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
      );
    `);
    
    // Run migrations for existing databases
    await runMigrations(db);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const addExpense = async (expense: Expense): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT INTO expenses (id, amount, description, category, date, notes, payment_method, account_id, receipt_uri, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        expense.id,
        expense.amount,
        expense.description,
        expense.category,
        expense.date,
        expense.notes || null,
        expense.paymentMethod || null,
        expense.accountId || null,
        expense.receiptUri || null,
        expense.tags ? JSON.stringify(expense.tags) : null,
      ]
    );
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getAllExpenses = async (): Promise<Expense[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<any>(
      'SELECT * FROM expenses ORDER BY date DESC'
    );
    return result.map((row: any) => ({
      id: row.id,
      amount: row.amount,
      description: row.description,
      category: row.category,
      date: row.date,
      notes: row.notes || undefined,
      paymentMethod: row.payment_method || undefined,
      accountId: row.account_id || undefined,
      receiptUri: row.receipt_uri || undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const updateExpense = async (expense: Expense): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE expenses SET amount = ?, description = ?, category = ?, date = ?, notes = ?, payment_method = ?, account_id = ?, receipt_uri = ?, tags = ? WHERE id = ?',
      [
        expense.amount,
        expense.description,
        expense.category,
        expense.date,
        expense.notes || null,
        expense.paymentMethod || null,
        expense.accountId || null,
        expense.receiptUri || null,
        expense.tags ? JSON.stringify(expense.tags) : null,
        expense.id,
      ]
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Filtered queries
export const getFilteredExpenses = async (filterOptions: FilterOptions): Promise<Expense[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];
    
    if (filterOptions.category) {
      query += ' AND category = ?';
      params.push(filterOptions.category);
    }
    
    if (filterOptions.startDate) {
      query += ' AND date >= ?';
      params.push(filterOptions.startDate);
    }
    
    if (filterOptions.endDate) {
      query += ' AND date <= ?';
      params.push(filterOptions.endDate);
    }
    
    if (filterOptions.searchQuery) {
      query += ' AND description LIKE ?';
      params.push(`%${filterOptions.searchQuery}%`);
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await db!.getAllAsync<Expense>(query, params);
    return result;
  } catch (error) {
    console.error('Error getting filtered expenses:', error);
    throw error;
  }
};

// Analytics queries
export const getMonthlyTotals = async (year?: number): Promise<{month: number, total: number}[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    let query = `
      SELECT 
        CAST(strftime('%m', date) AS INTEGER) as month,
        SUM(amount) as total
      FROM expenses
    `;
    const params: any[] = [];
    
    if (year) {
      query += ' WHERE strftime("%Y", date) = ?';
      params.push(year.toString());
    }
    
    query += ' GROUP BY month ORDER BY month';
    
    const result = await db!.getAllAsync<{month: number, total: number}>(query, params);
    return result;
  } catch (error) {
    console.error('Error getting monthly totals:', error);
    throw error;
  }
};

export const getCategoryTotals = async (startDate?: string, endDate?: string, category?: string): Promise<{category: string, total: number}[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    let query = `
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' GROUP BY category ORDER BY total DESC';
    
    const result = await db!.getAllAsync<{category: string, total: number}>(query, params);
    return result;
  } catch (error) {
    console.error('Error getting category totals:', error);
    throw error;
  }
};

// Budget operations
export const addBudget = async (budget: Budget): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT OR REPLACE INTO budgets (id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
      [budget.id, budget.category, budget.amount, budget.month, budget.year]
    );
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

export const getBudgets = async (month: number, year: number): Promise<Budget[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<Budget>(
      'SELECT * FROM budgets WHERE month = ? AND year = ?',
      [month, year]
    );
    return result;
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
};

export const getAllBudgets = async (): Promise<Budget[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<Budget>(
      'SELECT * FROM budgets ORDER BY year DESC, month DESC'
    );
    return result;
  } catch (error) {
    console.error('Error getting all budgets:', error);
    throw error;
  }
};

export const updateBudget = async (budget: Budget): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE budgets SET category = ?, amount = ?, month = ?, year = ? WHERE id = ?',
      [budget.category, budget.amount, budget.month, budget.year, budget.id]
    );
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

export const getBudgetProgress = async (category: string, month: number, year: number): Promise<number> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const result = await db!.getFirstAsync<{total: number}>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE category = ? AND date >= ? AND date <= ?',
      [category, startDate, endDate]
    );
    
    return result?.total || 0;
  } catch (error) {
    console.error('Error getting budget progress:', error);
    throw error;
  }
};

// Recurring expense operations
export const addRecurringExpense = async (recurring: RecurringExpense): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT INTO recurring_expenses (id, amount, description, category, frequency, start_date, end_date, next_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [recurring.id, recurring.amount, recurring.description, recurring.category, recurring.frequency, recurring.startDate, recurring.endDate || null, recurring.nextDueDate]
    );
  } catch (error) {
    console.error('Error adding recurring expense:', error);
    throw error;
  }
};

export const getRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<any>(
      'SELECT * FROM recurring_expenses ORDER BY next_due_date ASC'
    );
    return result.map(r => ({
      id: r.id,
      amount: r.amount,
      description: r.description,
      category: r.category,
      frequency: r.frequency as 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly',
      startDate: r.start_date,
      endDate: r.end_date,
      nextDueDate: r.next_due_date,
    }));
  } catch (error) {
    console.error('Error getting recurring expenses:', error);
    throw error;
  }
};

export const updateRecurringExpense = async (recurring: RecurringExpense): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE recurring_expenses SET amount = ?, description = ?, category = ?, frequency = ?, start_date = ?, end_date = ?, next_due_date = ? WHERE id = ?',
      [recurring.amount, recurring.description, recurring.category, recurring.frequency, recurring.startDate, recurring.endDate || null, recurring.nextDueDate, recurring.id]
    );
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    throw error;
  }
};

export const deleteRecurringExpense = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM recurring_expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    throw error;
  }
};

export const updateNextDueDate = async (id: string, nextDate: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('UPDATE recurring_expenses SET next_due_date = ? WHERE id = ?', [nextDate, id]);
  } catch (error) {
    console.error('Error updating next due date:', error);
    throw error;
  }
};

export const processRecurringExpenses = async (): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const recurring = await getRecurringExpenses();
    
    for (const rec of recurring) {
      if (rec.nextDueDate <= today && (!rec.endDate || rec.endDate >= today)) {
        // Create expense
        const expense: Expense = {
          id: `${rec.id}-${rec.nextDueDate}`,
          amount: rec.amount,
          description: rec.description,
          category: rec.category,
          date: rec.nextDueDate,
        };
        
        await addExpense(expense);
        
        // Calculate next due date
        const nextDate = new Date(rec.nextDueDate);
        if (rec.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (rec.frequency === 'bi-weekly') {
          nextDate.setDate(nextDate.getDate() + 14);
        } else if (rec.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (rec.frequency === 'quarterly') {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (rec.frequency === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else if (rec.frequency === 'daily') {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        await updateNextDueDate(rec.id, nextDate.toISOString().split('T')[0]);
      }
    }
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
    throw error;
  }
};

// Income operations
export const addIncome = async (income: Income): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT INTO incomes (id, amount, description, source, date, account_id) VALUES (?, ?, ?, ?, ?, ?)',
      [income.id, income.amount, income.description, income.source, income.date, income.accountId || null]
    );
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

export const getAllIncomes = async (): Promise<Income[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<any>(
      'SELECT * FROM incomes ORDER BY date DESC'
    );
    return result.map((row: any) => ({
      id: row.id,
      amount: row.amount,
      description: row.description,
      source: row.source,
      date: row.date,
      accountId: row.account_id || undefined,
    }));
  } catch (error) {
    console.error('Error getting incomes:', error);
    throw error;
  }
};

export const updateIncome = async (income: Income): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE incomes SET amount = ?, description = ?, source = ?, date = ?, account_id = ? WHERE id = ?',
      [income.amount, income.description, income.source, income.date, income.accountId || null, income.id]
    );
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

export const deleteIncome = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM incomes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

// Custom categories operations
export const addCustomCategory = async (category: CustomCategory): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT INTO custom_categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)',
      [category.id, category.name, category.color, category.icon, category.createdAt]
    );
  } catch (error) {
    console.error('Error adding custom category:', error);
    throw error;
  }
};

export const getAllCustomCategories = async (): Promise<CustomCategory[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<any>(
      'SELECT * FROM custom_categories ORDER BY created_at DESC'
    );
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting custom categories:', error);
    throw error;
  }
};

export const updateCustomCategory = async (category: CustomCategory): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE custom_categories SET name = ?, color = ?, icon = ? WHERE id = ?',
      [category.name, category.color, category.icon, category.id]
    );
  } catch (error) {
    console.error('Error updating custom category:', error);
    throw error;
  }
};

export const deleteCustomCategory = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM custom_categories WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting custom category:', error);
    throw error;
  }
};

// Expense templates operations
export const addExpenseTemplate = async (template: ExpenseTemplate): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'INSERT INTO expense_templates (id, name, amount, description, category, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [template.id, template.name, template.amount, template.description, template.category, template.paymentMethod || null]
    );
  } catch (error) {
    console.error('Error adding expense template:', error);
    throw error;
  }
};

export const getAllExpenseTemplates = async (): Promise<ExpenseTemplate[]> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    const result = await db!.getAllAsync<any>(
      'SELECT * FROM expense_templates ORDER BY name ASC'
    );
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      amount: row.amount,
      description: row.description,
      category: row.category,
      paymentMethod: row.payment_method || undefined,
    }));
  } catch (error) {
    console.error('Error getting expense templates:', error);
    throw error;
  }
};

export const updateExpenseTemplate = async (template: ExpenseTemplate): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync(
      'UPDATE expense_templates SET name = ?, amount = ?, description = ?, category = ?, payment_method = ? WHERE id = ?',
      [template.name, template.amount, template.description, template.category, template.paymentMethod || null, template.id]
    );
  } catch (error) {
    console.error('Error updating expense template:', error);
    throw error;
  }
};

export const deleteExpenseTemplate = async (id: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db!.runAsync('DELETE FROM expense_templates WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting expense template:', error);
    throw error;
  }
};
