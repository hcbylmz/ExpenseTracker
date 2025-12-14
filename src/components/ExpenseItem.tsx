import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { Expense } from '../types';
import { getCategoryById, getCategoryByIdAsync } from '../utils/categories';
import { getPaymentMethodById } from '../constants/paymentMethods';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrency();
  const { theme } = useTheme();
  const [category, setCategory] = React.useState(getCategoryById(expense.category));
  const paymentMethod = expense.paymentMethod ? getPaymentMethodById(expense.paymentMethod) : null;

  React.useEffect(() => {
    const loadCategory = async () => {
      const defaultCat = getCategoryById(expense.category);
      if (defaultCat) {
        setCategory(defaultCat);
      } else {
        const customCat = await getCategoryByIdAsync(expense.category);
        setCategory(customCat);
      }
    };
    loadCategory();
  }, [expense.category]);

  const categoryColor = category?.color || '#95A5A6';
  const categoryIcon = category?.icon || 'ellipsis-horizontal';
  const categoryName = category?.name || t('categories.other');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Ionicons name={categoryIcon as any} size={20} color={categoryColor} />
            <Text style={[styles.categoryText, { color: theme.colors.text }]}>{categoryName}</Text>
            {paymentMethod && (
              <View style={[styles.paymentBadge, { backgroundColor: theme.colors.border }]}>
                <Ionicons name={paymentMethod.icon as any} size={12} color={theme.colors.textSecondary} />
              </View>
            )}
          </View>
          <Text style={[styles.amount, { color: theme.colors.text }]}>{formatAmount(expense.amount)}</Text>
        </View>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {expense.description}
        </Text>
        {expense.notes && (
          <Text style={[styles.notes, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {expense.notes}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.colors.textTertiary }]}>{formatDate(expense.date)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(expense)}
            >
              <Ionicons name="pencil" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(expense.id)}
            >
              <Ionicons name="trash" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    marginBottom: 8,
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});
