import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCategoryTotals } from '../services/storage';
import { getCategoryById } from '../utils/categories';

interface CategoryComparisonProps {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const CategoryComparison: React.FC<CategoryComparisonProps> = ({
  startDate,
  endDate,
  category,
}) => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const [categoryData, setCategoryData] = useState<{category: string, total: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, category]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCategoryTotals(startDate, endDate, category);
      const sorted = data.sort((a, b) => b.total - a.total);
      setCategoryData(sorted);
    } catch (error) {
      console.error('Error loading category data:', error);
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

  if (categoryData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t('analytics.noDataAvailable')}</Text>
      </View>
    );
  }

  const total = categoryData.reduce((sum, item) => sum + item.total, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.categoryBreakdown')}</Text>
      {categoryData.map((item) => {
        const category = getCategoryById(item.category);
        const percentage = total > 0 ? (item.total / total) * 100 : 0;
        
        return (
          <View key={item.category} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <Ionicons
                  name={category?.icon as any}
                  size={20}
                  color={category?.color || '#95A5A6'}
                />
                <Text style={styles.categoryName}>
                  {category?.name || item.category}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>{formatAmount(item.total)}</Text>
                <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: category?.color || '#95A5A6',
                  },
                ]}
              />
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
    marginBottom: 16,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  percentage: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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

