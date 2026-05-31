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
  tabBar: string;
}

export const themes: Theme[] = [
  {
    id: 'theme1',
    name: 'تم ۱',
    primary: '#5B4FD9',
    primaryLight: '#EAE8FF',
    primaryDark: '#3D33B3',
    secondary: '#FF6B6B',
    background: '#F2F1FF',
    card: '#FFFFFF',
    text: '#1A1445',
    textLight: '#7B75B5',
    danger: '#FF4757',
    success: '#2ED573',
    shadow: '#5B4FD9',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme2',
    name: 'تم ۲',
    primary: '#0077CC',
    primaryLight: '#CCE8FF',
    primaryDark: '#005599',
    secondary: '#FF9500',
    background: '#EBF5FF',
    card: '#FFFFFF',
    text: '#001833',
    textLight: '#5599CC',
    danger: '#FF3B30',
    success: '#34C759',
    shadow: '#0077CC',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme3',
    name: 'تم ۳',
    primary: '#00875A',
    primaryLight: '#C8F0E0',
    primaryDark: '#005C3D',
    secondary: '#FF9500',
    background: '#E8FAF3',
    card: '#FFFFFF',
    text: '#00261A',
    textLight: '#4DA882',
    danger: '#FF3B30',
    success: '#00875A',
    shadow: '#00875A',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme4',
    name: 'تم ۴',
    primary: '#CC0066',
    primaryLight: '#FFD6EB',
    primaryDark: '#990044',
    secondary: '#6C63FF',
    background: '#FFF0F7',
    card: '#FFFFFF',
    text: '#33001A',
    textLight: '#CC6699',
    danger: '#FF3B30',
    success: '#34C759',
    shadow: '#CC0066',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme5',
    name: 'تم ۵',
    primary: '#007A6E',
    primaryLight: '#C8EFEB',
    primaryDark: '#005249',
    secondary: '#FF6B35',
    background: '#E8F9F7',
    card: '#FFFFFF',
    text: '#001F1C',
    textLight: '#4DA89E',
    danger: '#FF3B30',
    success: '#007A6E',
    shadow: '#007A6E',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme6',
    name: 'تم ۶',
    primary: '#CC4400',
    primaryLight: '#FFE0CC',
    primaryDark: '#993300',
    secondary: '#4A90D9',
    background: '#FFF5EE',
    card: '#FFFFFF',
    text: '#331100',
    textLight: '#CC8866',
    danger: '#FF3B30',
    success: '#34C759',
    shadow: '#CC4400',
    tabBar: '#FFFFFF',
  },
  {
    id: 'theme7',
    name: 'تم ۷',
    primary: '#8B2FC9',
    primaryLight: '#EDD6FF',
    primaryDark: '#6200A3',
    secondary: '#FF6B6B',
    background: '#F5EEFF',
    card: '#FFFFFF',
    text: '#1E0033',
    textLight: '#9966BB',
    danger: '#FF3B30',
    success: '#34C759',
    shadow: '#8B2FC9',
    tabBar: '#FFFFFF',
  },
];

export const defaultTheme = themes[0];
