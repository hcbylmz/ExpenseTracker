import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import { RecurringExpense } from '../types';
import { getCategoryById } from '../utils/categories';

interface RecurringExpenseListProps {
  recurringExpenses: RecurringExpense[];
  onEdit: (recurring: RecurringExpense) => void;
  onDelete: (id: string) => void;
}

export const RecurringExpenseList: React.FC<RecurringExpenseListProps> = ({
  recurringExpenses,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrency();
  
  if (recurringExpenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('recurring.noRecurring')}</Text>
        <Text style={styles.emptySubtext}>{t('recurring.noRecurringSubtext')}</Text>
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
      data={recurringExpenses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const category = getCategoryById(item.category);
        const isActive = !item.endDate || new Date(item.endDate) >= new Date();
        
        return (
          <View style={styles.container}>
            <View style={[styles.colorBar, { backgroundColor: category?.color || '#95A5A6' }]} />
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.categoryContainer}>
                  <Ionicons
                    name={category?.icon as any}
                    size={20}
                    color={category?.color || '#95A5A6'}
                  />
                  <Text style={styles.categoryText}>{category?.name || item.category}</Text>
                  {!isActive && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>{t('recurring.ended')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.footer}>
                <View style={styles.infoRow}>
                  <Ionicons name="repeat" size={14} color="#999" />
                  <Text style={styles.infoText}>
                    {item.frequency === 'weekly' ? t('recurring.weekly') : t('recurring.monthly')}
                  </Text>
                  <Ionicons name="calendar" size={14} color="#999" style={styles.iconSpacing} />
                  <Text style={styles.infoText}>{t('recurring.nextDueLabel')} {formatDate(item.nextDueDate)}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onEdit(item)}
                  >
                    <Ionicons name="pencil" size={18} color="#4ECDC4" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onDelete(item.id)}
                  >
                    <Ionicons name="trash" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      }}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  inactiveBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  inactiveText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
  },
  iconSpacing: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
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
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

