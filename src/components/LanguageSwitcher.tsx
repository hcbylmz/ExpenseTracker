import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsVisible(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.background }]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.flag}>{currentLanguage.flag}</Text>
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
              <Text style={styles.modalTitle}>{t('common.selectLanguage', 'Select Language')}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  i18n.language === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    i18n.language === lang.code && styles.languageNameActive,
                  ]}
                >
                  {lang.name}
                </Text>
                {i18n.language === lang.code && (
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
  flag: {
    fontSize: 20,
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
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  languageOptionActive: {
    backgroundColor: '#F0FDFF',
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  languageNameActive: {
    fontWeight: '600',
    color: '#4ECDC4',
  },
});

