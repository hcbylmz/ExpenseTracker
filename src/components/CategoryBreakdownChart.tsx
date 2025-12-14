import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { PieChart } from 'react-native-chart-kit';
import { getCategoryTotals } from '../services/storage';
import { getCategoryById } from '../utils/categories';

interface CategoryBreakdownChartProps {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
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
      setCategoryData(data);
    } catch (error) {
      console.error('Error loading category totals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('analytics.loadingChart')}</Text>
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

  const chartData = categoryData.map((item) => {
    const category = getCategoryById(item.category);
    return {
      name: category?.name || item.category,
      amount: item.total,
      color: category?.color || '#95A5A6',
      legendFontColor: '#666',
      legendFontSize: 11,
    };
  });

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // More padding to prevent overlap
  const chartHeight = 200;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.spendingByCategory')}</Text>
      <PieChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute
      />
      <View style={styles.legend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name}: {formatAmount(item.amount)}
            </Text>
          </View>
        ))}
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
    marginBottom: 12,
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
  legend: {
    marginTop: 12,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});

