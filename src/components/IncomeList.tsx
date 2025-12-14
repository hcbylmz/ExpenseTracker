import React from 'react';
import { FlatList, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { Income } from '../types';

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export const IncomeList: React.FC<IncomeListProps> = ({
  incomes,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrency();
  const { theme } = useTheme();
  
  if (incomes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>{t('income.noIncome')}</Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>{t('income.noIncomeSubtext')}</Text>
      </View>
    );
  }

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
    <FlatList
      data={incomes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.description, { color: theme.colors.text }]}>{item.description}</Text>
                <Text style={[styles.source, { color: theme.colors.textSecondary }]}>{item.source}</Text>
              </View>
              <Text style={[styles.amount, { color: theme.colors.success }]}>{formatAmount(item.amount)}</Text>
            </View>
            <View style={styles.footer}>
              <Text style={[styles.date, { color: theme.colors.textTertiary }]}>{formatDate(item.date)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                >
                  <Ionicons name="pencil" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete(item.id)}
                >
                  <Ionicons name="trash" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  container: {
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  source: {
    fontSize: 14,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
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
