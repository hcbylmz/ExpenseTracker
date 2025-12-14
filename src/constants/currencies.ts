export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameEn: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'Dolar',
    nameEn: 'US Dollar',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameEn: 'Euro',
  },
  {
    code: 'TRY',
    symbol: '₺',
    name: 'Türk Lirası',
    nameEn: 'Turkish Lira',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'İngiliz Sterlini',
    nameEn: 'British Pound',
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japon Yeni',
    nameEn: 'Japanese Yen',
  },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((curr) => curr.code === code);
};

export const DEFAULT_CURRENCY = 'USD';
