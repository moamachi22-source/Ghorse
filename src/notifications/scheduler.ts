import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication } from '@/database/medications';
import { buildScheduledDateTime } from '@/utils/calculations';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === 'granted';
};

export const configureNotifications = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('medication-reminder', {
      name: 'یادآوری دارو',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    Notifications.setNotificationChannelAsync('low-stock', {
      name: 'هشدار اتمام دارو',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }
};

export const scheduleMedicationNotifications = async (
  medication: Medication
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const granted = await requestNotificationPermission();

  if (!granted) return [];

  await cancelMedicationNotifications(medication.id);

  const today = new Date();

  for (const time of medication.times) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + dayOffset);

      const scheduledDateTime = buildScheduledDateTime(scheduleDate, time);

      if (scheduledDateTime <= new Date()) continue;

      const [hour, minute] = time.split(':').map(Number);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ وقت مصرف ${medication.name}`,
          body: `${medication.dose} — ${medication.pills_per_dose} عدد`,
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dose: medication.dose,
            pillsPerDose: medication.pills_per_dose,
            scheduledTime: scheduledDateTime.toISOString(),
            type: 'medication-reminder',
          },
          sound: medication.audio_uri ?? 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'medication-reminder',
          }),
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      notificationIds.push(id);
    }
  }

  return notificationIds;
};

export const scheduleSnoozeNotification = async (
  medication: Medication
): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ یادآوری مجدد: ${medication.name}`,
      body: `${medication.dose} — ${medication.pills_per_dose} عدد`,
      data: {
        medicationId: medication.id,
        medicationName: medication.name,
        dose: medication.dose,
        pillsPerDose: medication.pills_per_dose,
        type: 'snooze-reminder',
      },
      sound: medication.audio_uri ?? 'default',
      ...(Platform.OS === 'android' && {
        channelId: 'medication-reminder',
      }),
    },
    trigger: {
      seconds: 900,
    },
