import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { Income } from '../types';
import { getAllIncomes } from '../services/storage';

interface IncomeSummaryCardProps {
  startDate?: string;
  endDate?: string;
}

export const IncomeSummaryCard: React.FC<IncomeSummaryCardProps> = ({
  startDate,
  endDate,
}) => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const { theme } = useTheme();
  const [totalIncome, setTotalIncome] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncome();
  }, [startDate, endDate]);

  const loadIncome = async () => {
    try {
      setLoading(true);
      const allIncomes = await getAllIncomes();
      
      const filteredIncomes = startDate || endDate
        ? allIncomes.filter((income) => {
            if (startDate && income.date < startDate) return false;
            if (endDate && income.date > endDate) return false;
            return true;
          })
        : allIncomes;

      const total = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
      setTotalIncome(total);
      setCount(filteredIncomes.length);
    } catch (error) {
      console.error('Error loading income:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>{t('income.totalIncome')}</Text>
        <Text style={[styles.totalAmount, { color: theme.colors.success }]}>{formatAmount(totalIncome)}</Text>
      </View>
      <View style={[styles.statsContainer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{count}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{t('income.transactions')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatAmount(count > 0 ? totalIncome / count : 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{t('summary.average')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
});
