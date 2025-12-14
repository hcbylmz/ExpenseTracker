import { Category } from '../types';
import { useTranslation } from 'react-i18next';

export const CATEGORY_CONFIG = [
  {
    id: 'food',
    color: '#FF6B6B',
    icon: 'restaurant',
  },
  {
    id: 'transport',
    color: '#4ECDC4',
    icon: 'car',
  },
  {
    id: 'shopping',
    color: '#45B7D1',
    icon: 'bag',
  },
  {
    id: 'bills',
    color: '#FFA07A',
    icon: 'receipt',
  },
  {
    id: 'entertainment',
    color: '#98D8C8',
    icon: 'film',
  },
  {
    id: 'other',
    color: '#95A5A6',
    icon: 'ellipsis-horizontal',
  },
];

export const getCategories = (): Category[] => {
  // This will be called from components that have access to useTranslation
  return CATEGORY_CONFIG.map((cat) => ({
    ...cat,
    name: cat.id, // Will be translated in components
  }));
};

export const getCategoryById = (id: string): Omit<Category, 'name'> | undefined => {
  return CATEGORY_CONFIG.find((cat) => cat.id === id);
};
