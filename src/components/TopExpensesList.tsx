import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { Expense } from '../types';
import { getAllExpenses } from '../services/storage';
import { getCategoryById } from '../utils/categories';

interface TopExpensesListProps {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
}

export const TopExpensesList: React.FC<TopExpensesListProps> = ({
  startDate,
  endDate,
  category,
  limit = 5,
}) => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrency();
  const [topExpenses, setTopExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopExpenses();
  }, [startDate, endDate, category, limit]);

  const loadTopExpenses = async () => {
    try {
      setLoading(true);
      const allExpenses = await getAllExpenses();
      
      const filteredExpenses = (startDate || endDate || category)
        ? allExpenses.filter((exp) => {
            if (startDate && exp.date < startDate) return false;
            if (endDate && exp.date > endDate) return false;
            if (category && exp.category !== category) return false;
            return true;
          })
        : allExpenses;

      const sorted = [...filteredExpenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit);

      setTopExpenses(sorted);
    } catch (error) {
      console.error('Error loading top expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (topExpenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t('analytics.noExpensesAvailable')}</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.topExpenses', { count: limit })}</Text>
      {topExpenses.map((expense, index) => {
        const category = getCategoryById(expense.category);
        return (
          <View key={expense.id} style={styles.expenseItem}>
            <View style={styles.rankContainer}>
              <View style={[styles.rankBadge, { backgroundColor: category?.color || '#95A5A6' }]}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
            </View>
            <View style={styles.expenseContent}>
              <View style={styles.expenseHeader}>
                <View style={styles.categoryInfo}>
                  <Ionicons
                    name={category?.icon as any}
                    size={18}
                    color={category?.color || '#95A5A6'}
                  />
                  <Text style={styles.description} numberOfLines={1}>
                    {expense.description}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
              </View>
              <View style={styles.expenseFooter}>
                <Text style={styles.categoryName}>{category?.name || expense.category}</Text>
                <Text style={styles.date}>{formatDate(expense.date)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});

