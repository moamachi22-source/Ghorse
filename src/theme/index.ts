export interface Theme {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textLight: string;
  danger: string;
  success: string;
  shadow: string;
}

export const themes: Theme[] = [
  {
    id: 'purple',
    name: 'بنفش آرام',
    primary: '#6C63FF',
    primaryLight: '#F0EFFF',
    primaryDark: '#5A52D5',
    secondary: '#FF6B6B',
    background: '#F8F8FF',
    card: '#FFFFFF',
    text: '#2D2D3A',
    textLight: '#9E9EA7',
    danger: '#FF6B6B',
    success: '#4CAF50',
    shadow: '#6C63FF',
  },
  {
    id: 'blue',
    name: 'آبی آسمان',
    primary: '#2196F3',
    primaryLight: '#E3F2FD',
    primaryDark: '#1976D2',
    secondary: '#FF9800',
    background: '#F0F8FF',
    card: '#FFFFFF',
    text: '#1A2B3C',
    textLight: '#90A4AE',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#2196F3',
  },
  {
    id: 'green',
    name: 'سبز طبیعت',
    primary: '#4CAF50',
    primaryLight: '#E8F5E9',
    primaryDark: '#388E3C',
    secondary: '#FF9800',
    background: '#F1F8F1',
    card: '#FFFFFF',
    text: '#1B2E1C',
    textLight: '#81A882',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#4CAF50',
  },
  {
    id: 'pink',
    name: 'صورتی ملایم',
    primary: '#E91E8C',
    primaryLight: '#FCE4EC',
    primaryDark: '#C2185B',
    secondary: '#FF9800',
    background: '#FFF0F5',
    card: '#FFFFFF',
    text: '#3C1A2B',
    textLight: '#AE90A0',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#E91E8C',
  },
  {
    id: 'teal',
    name: 'فیروزه‌ای',
    primary: '#009688',
    primaryLight: '#E0F2F1',
    primaryDark: '#00796B',
    secondary: '#FF5722',
    background: '#F0FAFA',
    card: '#FFFFFF',
    text: '#1A2F2E',
    textLight: '#80CBC4',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#009688',
  },
  {
    id: 'orange',
    name: 'نارنجی گرم',
    primary: '#FF6F00',
    primaryLight: '#FFF3E0',
    primaryDark: '#E65100',
    secondary: '#5C6BC0',
    background: '#FFFAF0',
    card: '#FFFFFF',
    text: '#2E1A00',
    textLight: '#BCAAA4',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#FF6F00',
  },
  {
    id: 'rose',
    name: 'گلبهی',
    primary: '#FF8A80',
    primaryLight: '#FFF5F5',
    primaryDark: '#FF5252',
    secondary: '#80CBC4',
    background: '#FFF5F5',
    card: '#FFFFFF',
    text: '#3C2020',
    textLight: '#BCAAAA',
    danger: '#F44336',
    success: '#4CAF50',
    shadow: '#FF8A80',
  },
];

export const defaultTheme = themes[0];
