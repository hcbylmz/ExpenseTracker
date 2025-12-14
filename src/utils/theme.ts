export interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    cardBackground: string;
    shadow: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    text: '#2C3E50',
    textSecondary: '#666',
    textTertiary: '#999',
    border: '#F0F0F0',
    error: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFA07A',
    cardBackground: '#FFFFFF',
    shadow: '#000',
  },
};

export const darkTheme: Theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    border: '#2C2C2C',
    error: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFA07A',
    cardBackground: '#1E1E1E',
    shadow: '#000',
  },
};
