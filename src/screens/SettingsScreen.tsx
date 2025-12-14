import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { CurrencySwitcher } from '../components/CurrencySwitcher';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { currency, currencyCode } = useCurrency();

  const handleClearData = () => {
    Alert.alert(
      t('settings.clearData'),
      t('settings.clearDataConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data clearing
            Alert.alert(t('common.success'), t('settings.dataCleared'));
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // TODO: Implement data export
    Alert.alert(t('common.success'), t('settings.dataExported'));
  };

  const handleImportData = () => {
    // TODO: Implement data import
    Alert.alert(t('common.info'), t('settings.importComingSoon'));
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {children}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('settings.title')}</Text>
          <View style={styles.headerRight} />
        </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title={t('settings.appearance')}>
          <SettingItem
            icon="color-palette"
            title={t('settings.theme')}
            subtitle={isDark ? t('settings.darkMode') : t('settings.lightMode')}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
        </SettingSection>

        <SettingSection title={t('settings.localization')}>
          <SettingItem
            icon="language"
            title={t('settings.language')}
            subtitle={t('settings.languageSubtitle')}
            rightComponent={<LanguageSwitcher />}
            showArrow={false}
          />
          <SettingItem
            icon="cash"
            title={t('settings.currency')}
            subtitle={i18n.language === 'tr' ? currency.name : currency.nameEn}
            rightComponent={<CurrencySwitcher />}
            showArrow={false}
          />
        </SettingSection>

        <SettingSection title={t('settings.data')}>
          <SettingItem
            icon="download"
            title={t('settings.exportData')}
            subtitle={t('settings.exportDataSubtitle')}
            onPress={handleExportData}
          />
          <SettingItem
            icon="cloud-upload"
            title={t('settings.importData')}
            subtitle={t('settings.importDataSubtitle')}
            onPress={handleImportData}
          />
          <SettingItem
            icon="trash"
            title={t('settings.clearData')}
            subtitle={t('settings.clearDataSubtitle')}
            onPress={handleClearData}
          />
        </SettingSection>

        <SettingSection title={t('settings.about')}>
          <SettingItem
            icon="information-circle"
            title={t('settings.version')}
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="help-circle"
            title={t('settings.help')}
            subtitle={t('settings.helpSubtitle')}
            onPress={() => Alert.alert(t('settings.help'), t('settings.helpMessage'))}
          />
        </SettingSection>
      </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});
