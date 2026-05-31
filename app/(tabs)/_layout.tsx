import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ emoji, label, focused }) => {
  const { theme, fontSize } = useTheme();
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[
        styles.tabLabel,
        { fontSize: fontSize - 4, color: focused ? theme.primary : theme.textLight },
        focused && { fontFamily: 'Vazirmatn_Bold' },
      ]}>
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 8,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💊" label="داروها" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="تاریخچه" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="تنظیمات" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8 },
  tabEmoji: { fontSize: 24 },
  tabLabel: { fontFamily: 'Vazirmatn' },
});
