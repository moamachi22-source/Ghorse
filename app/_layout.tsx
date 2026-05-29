import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '../src/database/schema';
import { configureNotifications, rescheduleAllNotifications } from '../src/notifications/scheduler';
import { handleNotificationReceived, handleNotificationResponse, registerNotificationActions } from '../src/notifications/handlers';
import { getAllMedications } from '../src/database/medications';

I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Vazirmatn: require('../assets/fonts/Vazirmatn-Regular.ttf'),
    Vazirmatn_Bold: require('../assets/fonts/Vazirmatn-Bold.ttf'),
    Vazirmatn_Medium: require('../assets/fonts/Vazirmatn-Medium.ttf'),
  });

  useEffect(() => {
    const setup = async () => {
      try {
        initDatabase();
        configureNotifications();
        await registerNotificationActions();
        const medications = getAllMedications();
        if (medications.length > 0) {
          await rescheduleAllNotifications(medications);
        }
      } catch (error) {
        console.error('Setup error:', error);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    const responseSub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
