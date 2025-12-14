import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Expense, ExpenseTemplate } from '../types';
import { getCategories } from '../utils/categories';
import { useTheme } from '../contexts/ThemeContext';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import { TemplateManager } from './TemplateManager';

interface ExpenseFormProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  visible,
  expense,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const categories = getCategories();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [isTemplateManagerVisible, setIsTemplateManagerVisible] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setSelectedCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes || '');
      setSelectedPaymentMethod(expense.paymentMethod);
    } else {
      setAmount('');
      setDescription('');
      setSelectedCategory(categories[0].id);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setSelectedPaymentMethod(undefined);
    }
  }, [expense, visible, categories]);

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t('common.error'), t('expenses.amountError'));
      return;
    }
    
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('expenses.descriptionError'));
      return;
    }

    const expenseData: Expense = {
      id: expense?.id || Date.now().toString(),
      amount: amountNum,
      description: description.trim(),
      category: selectedCategory,
      date: date,
      notes: notes.trim() || undefined,
      paymentMethod: selectedPaymentMethod,
    };

    onSave(expenseData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {expense ? t('expenses.editExpense') : t('expenses.addExpense')}
            </Text>
            <View style={styles.headerActions}>
              {!expense && (
                <TouchableOpacity onPress={() => setIsTemplateManagerVisible(true)} style={styles.templateButton}>
                  <Ionicons name="copy" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>{t('expenses.amount')}</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('expenses.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('expenses.enterDescription')}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('expenses.category')}</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.id && {
                        backgroundColor: category.color,
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={
                        selectedCategory === category.id ? '#FFFFFF' : category.color
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.categoryTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('expenses.date')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('expenses.paymentMethod')}</Text>
              <View style={styles.paymentMethodRow}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodButton,
                      selectedPaymentMethod === method.id && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setSelectedPaymentMethod(selectedPaymentMethod === method.id ? undefined : method.id)}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={selectedPaymentMethod === method.id ? '#FFFFFF' : theme.colors.text}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        { color: selectedPaymentMethod === method.id ? '#FFFFFF' : theme.colors.text },
                      ]}
                    >
                      {t(`paymentMethods.${method.id}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('expenses.notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('expenses.notesPlaceholder')}
                multiline
                numberOfLines={3}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TemplateManager
        visible={isTemplateManagerVisible}
        onClose={() => setIsTemplateManagerVisible(false)}
        onSelectTemplate={(template) => {
          setAmount(template.amount.toString());
          setDescription(template.description);
          setSelectedCategory(template.category);
          setSelectedPaymentMethod(template.paymentMethod);
          setIsTemplateManagerVisible(false);
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  templateButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
