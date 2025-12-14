import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Expense } from '../types';
import { getCategoryById } from '../constants/categories';

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map((expense) => {
    const category = getCategoryById(expense.category);
    return [
      expense.date,
      category?.name || expense.category,
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.amount.toFixed(2),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
};

export const shareCSV = async (csvContent: string, filename: string = 'expenses.csv'): Promise<void> => {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Expenses',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing CSV:', error);
    throw error;
  }
};

export const saveToFile = async (csvContent: string, filename: string = 'expenses.csv'): Promise<string> => {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

