import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { ExpenseTemplate } from '../types';
import { getAllExpenseTemplates, addExpenseTemplate, updateExpenseTemplate, deleteExpenseTemplate } from '../services/storage';
import { getAllCategories } from '../utils/categories';
import { PAYMENT_METHODS } from '../constants/paymentMethods';

interface TemplateManagerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: ExpenseTemplate) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExpenseTemplate | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadTemplates();
      loadCategories();
    }
  }, [visible]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loaded = await getAllExpenseTemplates();
      setTemplates(loaded);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSave = async () => {
    const amountNum = parseFloat(amount);
    
    if (!name.trim() || !amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t('common.error'), t('templates.validationError'));
      return;
    }

    const template: ExpenseTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: name.trim(),
      amount: amountNum,
      description: description.trim(),
      category: category,
      paymentMethod: paymentMethod,
    };

    try {
      if (editingTemplate) {
        await updateExpenseTemplate(template);
      } else {
        await addExpenseTemplate(template);
      }
      await loadTemplates();
      setIsFormVisible(false);
      setEditingTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert(t('common.error'), t('errors.failedToSaveTemplate'));
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('templates.deleteTemplate'),
      t('templates.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseTemplate(id);
              await loadTemplates();
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert(t('common.error'), t('errors.failedToDeleteTemplate'));
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setDescription('');
    setCategory(categories[0]?.id || '');
    setPaymentMethod(undefined);
  };

  const openForm = (template?: ExpenseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setName(template.name);
      setAmount(template.amount.toString());
      setDescription(template.description);
      setCategory(template.category);
      setPaymentMethod(template.paymentMethod);
    } else {
      setEditingTemplate(null);
      resetForm();
    }
    setIsFormVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.manageTemplates')}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => openForm()} style={styles.addButton}>
                <Ionicons name="add" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textTertiary }}>{t('common.loading')}</Text>
            </View>
          ) : templates.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textTertiary }}>{t('templates.noTemplates')}</Text>
            </View>
          ) : (
            <FlatList
              data={templates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.templateItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={[styles.templateDetails, { color: theme.colors.textSecondary }]}>
                      {item.description} • {item.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.templateActions}>
                    {onSelectTemplate && (
                      <TouchableOpacity onPress={() => { onSelectTemplate(item); onClose(); }}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => openForm(item)}>
                      <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>

      {/* Template Form Modal */}
      <Modal visible={isFormVisible} animationType="slide" transparent onRequestClose={() => setIsFormVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.formHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                {editingTemplate ? t('templates.editTemplate') : t('templates.addTemplate')}
              </Text>
              <TouchableOpacity onPress={() => { setIsFormVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('templates.name')}</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('templates.namePlaceholder')}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('expenses.amount')}</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('expenses.description')}</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholder={t('expenses.enterDescription')}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </ScrollView>

            <View style={[styles.formFooter, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: theme.colors.border }]}
                onPress={() => { setIsFormVisible(false); resetForm(); }}
              >
                <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: '#FFFFFF' }}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  list: {
    padding: 16,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDetails: {
    fontSize: 14,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  formContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  formButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
