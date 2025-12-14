import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';

const CURRENCY_KEY = '@expense_tracker_currency';

export const getStoredCurrency = async (): Promise<string> => {
  try {
    const currency = await AsyncStorage.getItem(CURRENCY_KEY);
    return currency || DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Error getting stored currency:', error);
    return DEFAULT_CURRENCY;
  }
};

export const setStoredCurrency = async (currencyCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY, currencyCode);
  } catch (error) {
    console.error('Error storing currency:', error);
    throw error;
  }
};
