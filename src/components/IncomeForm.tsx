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
import { Income } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface IncomeFormProps {
  visible: boolean;
  income: Income | null;
  onClose: () => void;
  onSave: (income: Income) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  visible,
  income,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (income) {
      setAmount(income.amount.toString());
      setDescription(income.description);
      setSource(income.source);
      setDate(income.date);
    } else {
      setAmount('');
      setDescription('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [income, visible]);

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t('common.error'), t('income.amountError'));
      return;
    }
    
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('income.descriptionError'));
      return;
    }

    if (!source.trim()) {
      Alert.alert(t('common.error'), t('income.sourceError'));
      return;
    }

    const incomeData: Income = {
      id: income?.id || Date.now().toString(),
      amount: amountNum,
      description: description.trim(),
      source: source.trim(),
      date: date,
    };

    onSave(incomeData);
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
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {income ? t('income.editIncome') : t('income.addIncome')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('income.amount')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('income.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('income.enterDescription')}
                multiline
                numberOfLines={3}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('income.source')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={source}
                onChangeText={setSource}
                placeholder={t('income.enterSource')}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('income.date')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
