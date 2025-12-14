import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './src/i18n/config';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';

const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <>
      <HomeScreen />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
    <CurrencyProvider>
        <AppContent />
    </CurrencyProvider>
    </ThemeProvider>
  );
}
