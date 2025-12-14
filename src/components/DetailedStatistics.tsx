import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { getAllExpenses, getCategoryTotals } from '../services/storage';

interface DetailedStatisticsProps {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const DetailedStatistics: React.FC<DetailedStatisticsProps> = ({
  startDate,
  endDate,
  category,
}) => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState<{
    totalSpending: number;
    transactionCount: number;
    averageTransaction: number;
    largestExpense: number;
    smallestExpense: number;
    dailyAverage: number;
    categoryCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [startDate, endDate, category]);

  const loadStats = async () => {
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

      if (filteredExpenses.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      const amounts = filteredExpenses.map((e) => e.amount);
      const totalSpending = amounts.reduce((sum, amt) => sum + amt, 0);
      const transactionCount = filteredExpenses.length;
      const averageTransaction = totalSpending / transactionCount;
      const largestExpense = Math.max(...amounts);
      const smallestExpense = Math.min(...amounts);

      // Calculate date range
      const dates = filteredExpenses.map((e) => new Date(e.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
      const dailyAverage = daysDiff > 0 ? totalSpending / daysDiff : totalSpending;

      const categoryData = await getCategoryTotals(startDate, endDate, category);
      const categoryCount = categoryData.length;

      setStats({
        totalSpending,
        transactionCount,
        averageTransaction,
        largestExpense,
        smallestExpense,
        dailyAverage,
        categoryCount,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('analytics.loadingStatistics')}</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t('analytics.noDataAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.detailedStatistics')}</Text>
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={20} color="#4ECDC4" />
          <Text style={styles.statLabel}>{t('analytics.totalSpending')}</Text>
          <Text style={styles.statValue}>{formatAmount(stats.totalSpending)}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={20} color="#45B7D1" />
          <Text style={styles.statLabel}>{t('analytics.dailyAverage')}</Text>
          <Text style={styles.statValue}>{formatAmount(stats.dailyAverage)}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="arrow-up" size={20} color="#FF6B6B" />
          <Text style={styles.statLabel}>{t('analytics.largestExpense')}</Text>
          <Text style={styles.statValue}>{formatAmount(stats.largestExpense)}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="arrow-down" size={20} color="#98D8C8" />
          <Text style={styles.statLabel}>{t('analytics.smallestExpense')}</Text>
          <Text style={styles.statValue}>{formatAmount(stats.smallestExpense)}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={20} color="#FFA07A" />
          <Text style={styles.statLabel}>{t('analytics.transactions')}</Text>
          <Text style={styles.statValue}>{stats.transactionCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="pricetag" size={20} color="#95A5A6" />
          <Text style={styles.statLabel}>{t('analytics.categoriesUsed')}</Text>
          <Text style={styles.statValue}>{stats.categoryCount}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '30%',
    minWidth: 100,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
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

