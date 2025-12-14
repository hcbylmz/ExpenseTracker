import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, FilterOptions, Budget, RecurringExpense, Income } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseForm } from '../components/ExpenseForm';
import { FilterBar } from '../components/FilterBar';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { MonthlySpendingChart } from '../components/MonthlySpendingChart';
import { SpendingInsights } from '../components/SpendingInsights';
import { DetailedStatistics } from '../components/DetailedStatistics';
import { TopExpensesList } from '../components/TopExpensesList';
import { CategoryComparison } from '../components/CategoryComparison';
import { BudgetList } from '../components/BudgetList';
import { BudgetForm } from '../components/BudgetForm';
import { RecurringExpenseList } from '../components/RecurringExpenseList';
import { RecurringExpenseForm } from '../components/RecurringExpenseForm';
import { IncomeList } from '../components/IncomeList';
import { IncomeForm } from '../components/IncomeForm';
import { IncomeSummaryCard } from '../components/IncomeSummaryCard';
import { SettingsScreen } from './SettingsScreen';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import {
  initDatabase,
  getAllExpenses,
  getFilteredExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getAllBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpenses,
  getAllIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
} from '../services/storage';
import { exportToCSV, shareCSV } from '../services/exportService';
import { populateSampleData } from '../services/sampleData';

type Tab = 'expenses' | 'analytics' | 'budgets' | 'recurring' | 'income';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [analyticsFilters, setAnalyticsFilters] = useState<FilterOptions>({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetFormVisible, setIsBudgetFormVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isRecurringFormVisible, setIsRecurringFormVisible] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isIncomeFormVisible, setIsIncomeFormVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const loadData = async () => {
    try {
      await initDatabase();
      await processRecurringExpenses();
      await loadExpenses();
      await loadBudgets();
      await loadRecurringExpenses();
      await loadIncomes();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('errors.failedToLoad'));
    }
  };

  const loadExpenses = async () => {
    try {
      const loadedExpenses = await getAllExpenses();
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const loadedBudgets = await getAllBudgets();
      setBudgets(loadedBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const loadRecurringExpenses = async () => {
    try {
      const loaded = await getRecurringExpenses();
      setRecurringExpenses(loaded);
    } catch (error) {
      console.error('Error loading recurring expenses:', error);
    }
  };

  const loadIncomes = async () => {
    try {
      const loaded = await getAllIncomes();
      setIncomes(loaded);
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  };

  const applyFilters = async () => {
    try {
      if (Object.keys(filters).length === 0) {
        setFilteredExpenses(expenses);
      } else {
        const filtered = await getFilteredExpenses(filters);
        setFilteredExpenses(filtered);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredExpenses(expenses);
    }
  };

  const handleAddPress = () => {
    if (activeTab === 'budgets') {
      setEditingBudget(null);
      setIsBudgetFormVisible(true);
    } else if (activeTab === 'recurring') {
      setEditingRecurring(null);
      setIsRecurringFormVisible(true);
    } else if (activeTab === 'income') {
      setEditingIncome(null);
      setIsIncomeFormVisible(true);
    } else {
      setEditingExpense(null);
      setIsFormVisible(true);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormVisible(true);
  };

  const handleSave = async (expense: Expense) => {
    try {
      if (editingExpense) {
        await updateExpense(expense);
      } else {
        await addExpense(expense);
      }
      await loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert(t('common.error'), t('errors.failedToSave'));
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('expenses.deleteExpense'),
      t('expenses.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              await loadExpenses();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert(t('common.error'), t('errors.failedToDelete'));
            }
          },
        },
      ]
    );
  };

  const handleBudgetSave = async (budget: Budget) => {
    try {
      if (editingBudget) {
        await updateBudget(budget);
      } else {
      await addBudget(budget);
      }
      await loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert(t('common.error'), t('errors.failedToSaveBudget'));
    }
  };

  const handleBudgetDelete = (id: string) => {
    Alert.alert(
      t('budgets.deleteBudget'),
      t('budgets.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(id);
              await loadBudgets();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert(t('common.error'), t('errors.failedToDeleteBudget'));
            }
          },
        },
      ]
    );
  };

  const handleRecurringSave = async (recurring: RecurringExpense) => {
    try {
      if (editingRecurring) {
        await updateRecurringExpense(recurring);
      } else {
        await addRecurringExpense(recurring);
      }
      await loadRecurringExpenses();
    } catch (error) {
      console.error('Error saving recurring expense:', error);
      Alert.alert(t('common.error'), t('errors.failedToSaveRecurring'));
    }
  };

  const handleRecurringDelete = (id: string) => {
    Alert.alert(
      t('recurring.deleteRecurring'),
      t('recurring.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringExpense(id);
              await loadRecurringExpenses();
            } catch (error) {
              console.error('Error deleting recurring expense:', error);
              Alert.alert(t('common.error'), t('errors.failedToDeleteRecurring'));
            }
          },
        },
      ]
    );
  };

  const handleIncomeSave = async (income: Income) => {
    try {
      if (editingIncome) {
        await updateIncome(income);
      } else {
        await addIncome(income);
      }
      await loadIncomes();
    } catch (error) {
      console.error('Error saving income:', error);
      Alert.alert(t('common.error'), t('errors.failedToSaveIncome'));
    }
  };

  const handleIncomeDelete = (id: string) => {
    Alert.alert(
      t('income.deleteIncome'),
      t('income.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncome(id);
              await loadIncomes();
            } catch (error) {
              console.error('Error deleting income:', error);
              Alert.alert(t('common.error'), t('errors.failedToDeleteIncome'));
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const expensesToExport = filteredExpenses.length > 0 ? filteredExpenses : expenses;
      if (expensesToExport.length === 0) {
        Alert.alert(t('export.noData'), t('export.noDataMessage'));
        return;
      }
      const csv = exportToCSV(expensesToExport);
      await shareCSV(csv, `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert(t('common.error'), t('export.exportError'));
    }
  };

  const handlePopulateSampleData = () => {
    Alert.alert(
      t('sampleData.populate'),
      t('sampleData.confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('sampleData.populate'),
          onPress: async () => {
            try {
              await populateSampleData();
              await loadData();
              Alert.alert(t('common.success'), t('sampleData.success'));
            } catch (error) {
              console.error('Error populating sample data:', error);
              Alert.alert(t('common.error'), t('errors.failedToPopulate'));
            }
          },
        },
      ]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'expenses':
        return (
          <>
            <SummaryCard expenses={filteredExpenses.length > 0 ? filteredExpenses : expenses} />
            <FilterBar filters={filters} onFiltersChange={setFilters} />
            <ExpenseList
              expenses={filteredExpenses.length > 0 ? filteredExpenses : expenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        );
      case 'analytics':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <FilterBar 
              filters={analyticsFilters} 
              onFiltersChange={setAnalyticsFilters}
              hideSearch={true}
              defaultExpanded={true}
            />
            <SpendingInsights 
              startDate={analyticsFilters.startDate}
              endDate={analyticsFilters.endDate}
              category={analyticsFilters.category}
            />
            <DetailedStatistics 
              startDate={analyticsFilters.startDate}
              endDate={analyticsFilters.endDate}
              category={analyticsFilters.category}
            />
            <TopExpensesList 
              startDate={analyticsFilters.startDate}
              endDate={analyticsFilters.endDate}
              category={analyticsFilters.category}
              limit={5} 
            />
            <CategoryComparison 
              startDate={analyticsFilters.startDate}
              endDate={analyticsFilters.endDate}
              category={analyticsFilters.category}
            />
            <CategoryBreakdownChart 
              startDate={analyticsFilters.startDate}
              endDate={analyticsFilters.endDate}
              category={analyticsFilters.category}
            />
            <MonthlySpendingChart />
          </ScrollView>
        );
      case 'budgets':
        return (
          <BudgetList
            budgets={budgets}
            onEdit={(budget) => {
              setEditingBudget(budget);
              setIsBudgetFormVisible(true);
            }}
            onDelete={handleBudgetDelete}
          />
        );
      case 'recurring':
        return (
          <RecurringExpenseList
            recurringExpenses={recurringExpenses}
            onEdit={(recurring) => {
              setEditingRecurring(recurring);
              setIsRecurringFormVisible(true);
            }}
            onDelete={handleRecurringDelete}
          />
        );
      case 'income':
        return (
          <>
            <IncomeSummaryCard />
            <IncomeList
              incomes={incomes}
              onEdit={(income) => {
                setEditingIncome(income);
                setIsIncomeFormVisible(true);
              }}
              onDelete={handleIncomeDelete}
            />
          </>
        );
      default:
        return null;
    }
  };

  const getFabIcon = () => {
    if (activeTab === 'budgets') return 'wallet';
    if (activeTab === 'recurring') return 'repeat';
    if (activeTab === 'income') return 'add-circle';
    return 'add';
  };

  const dynamicStyles = createStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>{t('app.title')}</Text>
        <View style={dynamicStyles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsSettingsVisible(true)}
            style={styles.settingsButton}
          >
            <Ionicons name="settings" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          {activeTab === 'expenses' && (
            <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
              <Ionicons name="download" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={dynamicStyles.tabs}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'expenses' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Ionicons
            name="receipt"
            size={20}
            color={activeTab === 'expenses' ? theme.colors.primary : theme.colors.textTertiary}
          />
          <Text
            style={[
              dynamicStyles.tabText,
              activeTab === 'expenses' && dynamicStyles.tabTextActive,
            ]}
          >
            {t('app.expenses')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'analytics' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons
            name="bar-chart"
            size={20}
            color={activeTab === 'analytics' ? theme.colors.primary : theme.colors.textTertiary}
          />
          <Text
            style={[
              dynamicStyles.tabText,
              activeTab === 'analytics' && dynamicStyles.tabTextActive,
            ]}
          >
            {t('app.analytics')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'budgets' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('budgets')}
        >
          <Ionicons
            name="wallet"
            size={20}
            color={activeTab === 'budgets' ? theme.colors.primary : theme.colors.textTertiary}
          />
          <Text
            style={[
              dynamicStyles.tabText,
              activeTab === 'budgets' && dynamicStyles.tabTextActive,
            ]}
          >
            {t('app.budgets')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'recurring' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('recurring')}
        >
          <Ionicons
            name="repeat"
            size={20}
            color={activeTab === 'recurring' ? theme.colors.primary : theme.colors.textTertiary}
          />
          <Text
            style={[
              dynamicStyles.tabText,
              activeTab === 'recurring' && dynamicStyles.tabTextActive,
            ]}
          >
            {t('app.recurring')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'income' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('income')}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={activeTab === 'income' ? theme.colors.primary : theme.colors.textTertiary}
          />
          <Text
            style={[
              dynamicStyles.tabText,
              activeTab === 'income' && dynamicStyles.tabTextActive,
            ]}
          >
            {t('app.income')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.content}>{renderContent()}</View>

      <TouchableOpacity
        style={dynamicStyles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name={getFabIcon()} size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ExpenseForm
        visible={isFormVisible}
        expense={editingExpense}
        onClose={() => {
          setIsFormVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleSave}
      />

      <BudgetForm
        visible={isBudgetFormVisible}
        budget={editingBudget}
        onClose={() => {
          setIsBudgetFormVisible(false);
          setEditingBudget(null);
        }}
        onSave={handleBudgetSave}
      />

      <RecurringExpenseForm
        visible={isRecurringFormVisible}
        recurring={editingRecurring}
        onClose={() => {
          setIsRecurringFormVisible(false);
          setEditingRecurring(null);
        }}
        onSave={handleRecurringSave}
      />

      <IncomeForm
        visible={isIncomeFormVisible}
        income={editingIncome}
        onClose={() => {
          setIsIncomeFormVisible(false);
          setEditingIncome(null);
        }}
        onSave={handleIncomeSave}
      />

      <SettingsScreen
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 4,
  },
  exportButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

const styles = createStyles({ colors: {} }); // Will be replaced with theme
