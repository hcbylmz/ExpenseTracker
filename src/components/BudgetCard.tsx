import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { Budget } from '../types';
import { getBudgetProgress } from '../services/storage';
import { getCategoryById } from '../utils/categories';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrency();
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [budget]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progress = await getBudgetProgress(budget.category, budget.month, budget.year);
      setSpent(progress);
    } catch (error) {
      console.error('Error loading budget progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const category = getCategoryById(budget.category);
  const percentage = (spent / budget.amount) * 100;
  const remaining = budget.amount - spent;
  
  const getProgressColor = () => {
    if (percentage >= 100) return '#FF6B6B';
    if (percentage >= 80) return '#FFA07A';
    return '#4ECDC4';
  };

  const monthNames = [
    t('monthShort.jan'), t('monthShort.feb'), t('monthShort.mar'),
    t('monthShort.apr'), t('monthShort.may'), t('monthShort.jun'),
    t('monthShort.jul'), t('monthShort.aug'), t('monthShort.sep'),
    t('monthShort.oct'), t('monthShort.nov'), t('monthShort.dec')
  ];
  const monthName = monthNames[budget.month - 1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Ionicons
            name={category?.icon as any}
            size={24}
            color={category?.color || '#95A5A6'}
          />
          <View style={styles.categoryTextContainer}>
            <Text style={styles.categoryName}>{category?.name || budget.category}</Text>
            <Text style={styles.monthText}>{monthName} {budget.year}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(budget)} style={styles.actionButton}>
            <Ionicons name="pencil" size={18} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(budget.id)} style={styles.actionButton}>
            <Ionicons name="trash" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.label}>{t('budgets.budget')}</Text>
            <Text style={styles.amount}>{formatAmount(budget.amount)}</Text>
          </View>
          <View>
            <Text style={styles.label}>{t('budgets.spent')}</Text>
            <Text style={[styles.amount, { color: getProgressColor() }]}>
              {formatAmount(spent)}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>{t('budgets.remaining')}</Text>
            <Text style={[styles.amount, { color: remaining >= 0 ? '#4ECDC4' : '#FF6B6B' }]}>
              {formatAmount(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  monthText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  progressContainer: {
    gap: 12,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
});

