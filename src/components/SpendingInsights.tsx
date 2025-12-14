import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCategoryTotals, getAllExpenses } from '../services/storage';
import { getCategoryById } from '../utils/categories';

interface SpendingInsightsProps {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const SpendingInsights: React.FC<SpendingInsightsProps> = ({
  startDate,
  endDate,
  category,
}) => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const [insights, setInsights] = useState<{
    highestCategory: string;
    highestAmount: number;
    totalExpenses: number;
    averageExpense: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [startDate, endDate, category]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const categoryData = await getCategoryTotals(startDate, endDate, category);
      const allExpenses = await getAllExpenses();
      
      const filteredExpenses = (startDate || endDate || category)
        ? allExpenses.filter((exp) => {
            if (startDate && exp.date < startDate) return false;
            if (endDate && exp.date > endDate) return false;
            if (category && exp.category !== category) return false;
            return true;
          })
        : allExpenses;

      let highestCategory = 'N/A';
      let highestAmount = 0;

      if (categoryData.length > 0) {
        const highest = categoryData.reduce((prev, current) =>
          current.total > prev.total ? current : prev
        );
        highestCategory = getCategoryById(highest.category)?.name || highest.category;
        highestAmount = highest.total;
      }

      const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const average = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;

      setInsights({
        highestCategory,
        highestAmount,
        totalExpenses: filteredExpenses.length,
        averageExpense: average,
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('analytics.loadingInsights')}</Text>
      </View>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.spendingInsights')}</Text>
      <View style={styles.insightsGrid}>
        <View style={styles.insightCard}>
          <Ionicons name="trending-up" size={24} color="#FF6B6B" />
          <Text style={styles.insightLabel}>{t('analytics.highestCategory')}</Text>
          <Text style={styles.insightValue}>{insights.highestCategory}</Text>
          <Text style={styles.insightAmount}>{formatAmount(insights.highestAmount)}</Text>
        </View>
        <View style={styles.insightCard}>
          <Ionicons name="receipt" size={24} color="#4ECDC4" />
          <Text style={styles.insightLabel}>{t('analytics.totalExpenses')}</Text>
          <Text style={styles.insightValue}>{insights.totalExpenses}</Text>
          <Text style={styles.insightSubtext}>{t('analytics.transactions')}</Text>
        </View>
        <View style={styles.insightCard}>
          <Ionicons name="calculator" size={24} color="#45B7D1" />
          <Text style={styles.insightLabel}>{t('analytics.average')}</Text>
          <Text style={styles.insightValue}>{formatAmount(insights.averageExpense)}</Text>
          <Text style={styles.insightSubtext}>{t('analytics.perExpense')}</Text>
        </View>
      </View>
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
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
    textAlign: 'center',
  },
  insightAmount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  insightSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});

