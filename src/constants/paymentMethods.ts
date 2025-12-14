export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', icon: 'cash' },
  { id: 'card', name: 'Card', icon: 'card' },
  { id: 'digital', name: 'Digital Wallet', icon: 'wallet' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'swap-horizontal' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' },
];

export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find((method) => method.id === id);
};
