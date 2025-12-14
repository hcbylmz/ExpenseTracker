import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Currency, getCurrencyByCode, DEFAULT_CURRENCY } from '../constants/currencies';
import { getStoredCurrency, setStoredCurrency } from '../services/currencyStorage';

interface CurrencyContextType {
  currency: Currency;
  currencyCode: string;
  setCurrency: (code: string) => Promise<void>;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY);
  const [currency, setCurrencyState] = useState<Currency>(
    getCurrencyByCode(DEFAULT_CURRENCY)!
  );

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const stored = await getStoredCurrency();
      const curr = getCurrencyByCode(stored);
      if (curr) {
        setCurrencyCode(stored);
        setCurrencyState(curr);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const setCurrency = async (code: string) => {
    try {
      const curr = getCurrencyByCode(code);
      if (curr) {
        await setStoredCurrency(code);
        setCurrencyCode(code);
        setCurrencyState(curr);
      }
    } catch (error) {
      console.error('Error setting currency:', error);
      throw error;
    }
  };

  const formatAmount = (amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    // For currencies like TRY, EUR, GBP, put symbol after
    if (['TRY', 'EUR', 'GBP'].includes(currency.code)) {
      return `${formatted} ${currency.symbol}`;
    }
    // For USD, JPY, put symbol before
    return `${currency.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
