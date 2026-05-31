import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../src/theme/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const { initDatabase } = require('../src/database/schema');
        initDatabase();
      } catch (e: any) {
        setError('DB: ' + e.message);
      }
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    };
    setup();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ScrollView>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="medication/add" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="medication/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FF0000',
    padding: 20,
    paddingTop: 60,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
});
