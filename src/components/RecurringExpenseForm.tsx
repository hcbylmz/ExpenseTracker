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
import { RecurringExpense } from '../types';
import { getCategories } from '../utils/categories';

interface RecurringExpenseFormProps {
  visible: boolean;
  recurring: RecurringExpense | null;
  onClose: () => void;
  onSave: (recurring: RecurringExpense) => void;
}

export const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({
  visible,
  recurring,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const categories = getCategories();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (recurring) {
      setAmount(recurring.amount.toString());
      setDescription(recurring.description);
      setSelectedCategory(recurring.category);
      setFrequency(recurring.frequency);
      setStartDate(recurring.startDate);
      setEndDate(recurring.endDate || '');
    } else {
      setAmount('');
      setDescription('');
      setSelectedCategory(categories[0].id);
      setFrequency('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
  }, [recurring, visible]);

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t('common.error'), t('recurring.amountError'));
      return;
    }
    
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('recurring.descriptionError'));
      return;
    }

    // Calculate next due date (start with start date)
    const nextDueDate = startDate;

    const recurringData: RecurringExpense = {
      id: recurring?.id || Date.now().toString(),
      amount: amountNum,
      description: description.trim(),
      category: selectedCategory,
      frequency: frequency,
      startDate: startDate,
      endDate: endDate || undefined,
      nextDueDate: nextDueDate,
    };

    onSave(recurringData);
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
              {recurring ? t('recurring.editRecurring') : t('recurring.addRecurring')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
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
              <Text style={styles.label}>{t('recurring.frequency')}</Text>
              <View style={styles.frequencyGrid}>
                {(['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                <TouchableOpacity
                    key={freq}
                    style={[
                    styles.frequencyButton,
                      frequency === freq && styles.frequencyButtonSelected,
                  ]}
                    onPress={() => setFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                        frequency === freq && styles.frequencyButtonTextSelected,
                    ]}
                  >
                      {t(`recurring.${freq}`)}
                  </Text>
                </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('recurring.startDate')}</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('recurring.endDateOptional')}</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder={t('recurring.endDatePlaceholder')}
                placeholderTextColor="#999"
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
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    minWidth: '30%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  frequencyButtonTextSelected: {
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

