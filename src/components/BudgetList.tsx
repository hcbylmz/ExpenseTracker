import React from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Budget } from '../types';
import { BudgetCard } from './BudgetCard';

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  
  if (budgets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('budgets.noBudgets')}</Text>
        <Text style={styles.emptySubtext}>{t('budgets.noBudgetsSubtext')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={budgets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BudgetCard budget={item} onEdit={onEdit} onDelete={onDelete} />
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

