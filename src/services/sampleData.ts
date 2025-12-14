import { Expense, Budget, RecurringExpense } from '../types';
import { CATEGORIES } from '../constants/categories';
import {
  addExpense,
  addBudget,
  addRecurringExpense,
  initDatabase,
} from './storage';

const getRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRandomCategory = (): string => {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
};

const getRandomAmount = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

export const generateSampleExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const descriptions = [
    'Grocery shopping',
    'Uber ride',
    'Coffee shop',
    'Restaurant dinner',
    'Gas station',
    'Amazon purchase',
    'Netflix subscription',
    'Electricity bill',
    'Phone bill',
    'Gym membership',
    'Movie tickets',
    'Concert tickets',
    'Book store',
    'Pharmacy',
    'Fast food',
    'Parking fee',
    'Train ticket',
    'Hotel booking',
    'Online course',
    'Software subscription',
  ];

  // Generate expenses for the last 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const category = getRandomCategory();
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    let amount: number;
    if (category === 'food') {
      amount = getRandomAmount(5, 80);
    } else if (category === 'transport') {
      amount = getRandomAmount(10, 150);
    } else if (category === 'bills') {
      amount = getRandomAmount(30, 200);
    } else if (category === 'shopping') {
      amount = getRandomAmount(15, 300);
    } else if (category === 'entertainment') {
      amount = getRandomAmount(10, 100);
    } else {
      amount = getRandomAmount(5, 150);
    }

    expenses.push({
      id: `sample-expense-${i}-${Date.now()}`,
      amount: amount,
      description: description,
      category: category,
      date: getRandomDate(daysAgo),
    });
  }

  return expenses;
};

export const generateSampleBudgets = (): Budget[] => {
  const budgets: Budget[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Create budgets for main categories
  const budgetAmounts: { [key: string]: number } = {
    food: 500,
    transport: 200,
    shopping: 300,
    bills: 400,
    entertainment: 150,
    other: 100,
  };

  Object.entries(budgetAmounts).forEach(([category, amount], index) => {
    budgets.push({
      id: `sample-budget-${index}-${Date.now()}`,
      category: category,
      amount: amount,
      month: currentMonth,
      year: currentYear,
    });
  });

  return budgets;
};

export const generateSampleRecurringExpenses = (): RecurringExpense[] => {
  const recurring: RecurringExpense[] = [];
  const now = new Date();
  const startDate = now.toISOString().split('T')[0];

  const recurringItems = [
    {
      description: 'Netflix Subscription',
      amount: 15.99,
      category: 'entertainment',
      frequency: 'monthly' as const,
    },
    {
      description: 'Gym Membership',
      amount: 49.99,
      category: 'other',
      frequency: 'monthly' as const,
    },
    {
      description: 'Phone Bill',
      amount: 79.99,
      category: 'bills',
      frequency: 'monthly' as const,
    },
    {
      description: 'Weekly Groceries',
      amount: 120.00,
      category: 'food',
      frequency: 'weekly' as const,
    },
    {
      description: 'Spotify Premium',
      amount: 9.99,
      category: 'entertainment',
      frequency: 'monthly' as const,
    },
  ];

  recurringItems.forEach((item, index) => {
    const nextDueDate = new Date(startDate);
    if (item.frequency === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    } else {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    recurring.push({
      id: `sample-recurring-${index}-${Date.now()}`,
      amount: item.amount,
      description: item.description,
      category: item.category,
      frequency: item.frequency,
      startDate: startDate,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
    });
  });

  return recurring;
};

export const populateSampleData = async (): Promise<void> => {
  try {
    await initDatabase();

    // Generate sample data
    const expenses = generateSampleExpenses();
    const budgets = generateSampleBudgets();
    const recurring = generateSampleRecurringExpenses();

    // Add expenses
    for (const expense of expenses) {
      await addExpense(expense);
    }

    // Add budgets
    for (const budget of budgets) {
      await addBudget(budget);
    }

    // Add recurring expenses
    for (const rec of recurring) {
      await addRecurringExpense(rec);
    }

    console.log('Sample data populated successfully!');
    console.log(`- ${expenses.length} expenses`);
    console.log(`- ${budgets.length} budgets`);
    console.log(`- ${recurring.length} recurring expenses`);
  } catch (error) {
    console.error('Error populating sample data:', error);
    throw error;
  }
};

