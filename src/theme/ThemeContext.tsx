import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes, defaultTheme } from './index';

interface ThemeContextType {
  theme: Theme;
  fontSize: number;
  setTheme: (themeId: string) => void;
  setFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  fontSize: 16,
  setTheme: () => {},
  setFontSize: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [fontSize, setFontSizeState] = useState(16);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const themeId = await AsyncStorage.getItem('theme_id');
      const savedFontSize = await AsyncStorage.getItem('font_size');
      if (themeId) {
        const found = themes.find((t) => t.id === themeId);
        if (found) setThemeState(found);
      }
      if (savedFontSize) {
        setFontSizeState(Number(savedFontSize));
      }
    } catch (e) {}
  };

  const setTheme = async (themeId: string) => {
    const found = themes.find((t) => t.id === themeId);
    if (found) {
      setThemeState(found);
      await AsyncStorage.setItem('theme_id', themeId);
    }
  };

  const setFontSize = async (size: number) => {
    setFontSizeState(size);
    await AsyncStorage.setItem('font_size', String(size));
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
