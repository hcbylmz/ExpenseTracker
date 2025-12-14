import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { CURRENCIES } from '../constants/currencies';

export const CurrencySwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const changeCurrency = async (code: string) => {
    try {
      await setCurrency(code);
      setIsVisible(false);
    } catch (error) {
      console.error('Error changing currency:', error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.background }]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>{currency.symbol}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('common.selectCurrency', 'Select Currency')}
              </Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  currency.code === curr.code && styles.currencyOptionActive,
                ]}
                onPress={() => changeCurrency(curr.code)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <View style={styles.currencyDetails}>
                    <Text
                      style={[
                        styles.currencyName,
                        currency.code === curr.code && styles.currencyNameActive,
                      ]}
                    >
                      {i18n.language === 'tr' ? curr.name : curr.nameEn}
                    </Text>
                    <Text style={styles.currencyCode}>{curr.code}</Text>
                  </View>
                </View>
                {currency.code === curr.code && (
                  <Ionicons name="checkmark" size={20} color="#4ECDC4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  currencyOptionActive: {
    backgroundColor: '#F0FDFF',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    color: '#2C3E50',
  },
  currencyNameActive: {
    fontWeight: '600',
    color: '#4ECDC4',
  },
  currencyCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
