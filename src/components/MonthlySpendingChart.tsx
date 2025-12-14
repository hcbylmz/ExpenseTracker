import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getMonthlyTotals } from '../services/storage';

interface MonthlySpendingChartProps {
  year?: number;
  chartType?: 'line' | 'bar';
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
  year,
  chartType = 'line',
}) => {
  const { t } = useTranslation();
  const [monthlyData, setMonthlyData] = useState<{month: number, total: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMonthlyTotals(year);
      setMonthlyData(data);
    } catch (error) {
      console.error('Error loading monthly totals:', error);
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

  if (monthlyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t('analytics.noDataAvailable')}</Text>
      </View>
    );
  }

  const monthNames = [
    t('monthShort.jan'), t('monthShort.feb'), t('monthShort.mar'),
    t('monthShort.apr'), t('monthShort.may'), t('monthShort.jun'),
    t('monthShort.jul'), t('monthShort.aug'), t('monthShort.sep'),
    t('monthShort.oct'), t('monthShort.nov'), t('monthShort.dec')
  ];
  
  // Create array for all 12 months, filling in zeros for months without data
  const fullData = Array.from({ length: 12 }, (_, i) => {
    const monthData = monthlyData.find((d) => d.month === i + 1);
    return monthData ? monthData.total : 0;
  });

  const labels = fullData.map((_, i) => monthNames[i]);
  const data = {
    labels: labels,
    datasets: [
      {
        data: fullData,
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // More padding
  const chartHeight = 200;
  
  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#4ECDC4',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('analytics.monthlySpending')} {year ? `(${year})` : ''}
      </Text>
      {chartType === 'line' ? (
        <LineChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
        />
      ) : (
        <BarChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      )}
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
  chart: {
    marginVertical: 4,
    borderRadius: 16,
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

