import { Category } from '../types';
import { CATEGORY_CONFIG } from '../constants/categories';
import i18n from '../i18n/config';
import { getAllCustomCategories } from '../services/storage';

// Synchronous function for default categories (used by most components)
export const getCategories = (): Category[] => {
  return CATEGORY_CONFIG.map((cat) => ({
    ...cat,
    name: i18n.t(`categories.${cat.id}`),
  }));
};

// Async function to get all categories including custom ones
export const getAllCategories = async (): Promise<Category[]> => {
  const defaultCategories = CATEGORY_CONFIG.map((cat) => ({
    ...cat,
    name: i18n.t(`categories.${cat.id}`),
  }));
  
  try {
    const customCategories = await getAllCustomCategories();
    const customCategoriesFormatted: Category[] = customCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));
    
    return [...defaultCategories, ...customCategoriesFormatted];
  } catch (error) {
    console.error('Error loading custom categories:', error);
    return defaultCategories;
  }
};

// Synchronous function for default categories
export const getCategoryById = (id: string): Category | undefined => {
  const defaultConfig = CATEGORY_CONFIG.find((cat) => cat.id === id);
  if (defaultConfig) {
    return {
      ...defaultConfig,
      name: i18n.t(`categories.${id}`),
    };
  }
  return undefined;
};

// Async function to get category including custom ones
export const getCategoryByIdAsync = async (id: string): Promise<Category | undefined> => {
  const defaultConfig = CATEGORY_CONFIG.find((cat) => cat.id === id);
  if (defaultConfig) {
  return {
      ...defaultConfig,
    name: i18n.t(`categories.${id}`),
  };
  }
  
  try {
    const customCategories = await getAllCustomCategories();
    const customCategory = customCategories.find((cat) => cat.id === id);
    if (customCategory) {
      return {
        id: customCategory.id,
        name: customCategory.name,
        color: customCategory.color,
        icon: customCategory.icon,
      };
    }
  } catch (error) {
    console.error('Error loading custom category:', error);
  }
  
  return undefined;
};

