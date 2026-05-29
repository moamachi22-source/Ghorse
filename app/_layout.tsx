import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const { initDatabase } = require('../src/database/schema');
        initDatabase();
      } catch (e: any) {
        setError('DB: ' + e.message);
        return;
      }
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
      setReady(true);
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

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#6C63FF' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="medication/add" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="medication/[id]" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
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
