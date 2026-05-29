import React, { useEffect, useState } from 'react';
import { I18nManager, View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState('starting');

  useEffect(() => {
    const setup = async () => {
      try {
        setStep('loading database');
        const { initDatabase } = require('../src/database/schema');
        initDatabase();
        setStep('database ok');
      } catch (e: any) {
        setError('Database error: ' + e.message);
        return;
      }

      try {
        setStep('loading notifications');
        const { configureNotifications, rescheduleAllNotifications } = require('../src/notifications/scheduler');
        const { registerNotificationActions } = require('../src/notifications/handlers');
        configureNotifications();
        await registerNotificationActions();
        setStep('notifications ok');
      } catch (e: any) {
        setError('Notification error: ' + e.message);
        return;
      }

      try {
        setStep('loading medications');
        const { getAllMedications } = require('../src/database/medications');
        const { rescheduleAllNotifications } = require('../src/notifications/scheduler');
        const medications = getAllMedications();
        if (medications.length > 0) {
          await rescheduleAllNotifications(medications);
        }
        setStep('all ok');
      } catch (e: any) {
        setError('Medications error: ' + e.message);
        return;
      }

      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    };

    setup();
  }, []);

  useEffect(() => {
    try {
      const receivedSub = Notifications.addNotificationReceivedListener(() => {});
      const responseSub = Notifications.addNotificationResponseReceivedListener(() => {});
      return () => {
        receivedSub.remove();
        responseSub.remove();
      };
    } catch (e) {}
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ScrollView>
          <Text style={styles.errorTitle}>خطا پیدا شد:</Text>
          <Text style={styles.errorStep}>مرحله: {step}</Text>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </View>
    );
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
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorStep: {
    color: '#FFFF00',
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
  },
});
