import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication } from '../database/medications';
import { buildScheduledDateTime } from '../utils/calculations';

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

export const scheduleMedicationNotifications = async (medication: Medication): Promise<string[]> => {
  const notificationIds: string[] = [];
  const granted = await requestNotificationPermission();
  if (!granted) return [];
  await cancelMedicationNotifications(medication.id);
  const today = new Date();
  for (const time of medication.times) {
    const [hour, minute] = time.split(':').map(Number);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'وقت مصرف ' + medication.name,
        body: medication.dose + ' — ' + medication.pills_per_dose + ' عدد',
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
          dose: medication.dose,
          pillsPerDose: medication.pills_per_dose,
          type: 'medication-reminder',
        },
        sound: medication.audio_uri ? medication.audio_uri : 'default',
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });
    notificationIds.push(id);
  }
  return notificationIds;
};

export const scheduleSnoozeNotification = async (medication: Medication): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'یادآوری مجدد: ' + medication.name,
      body: medication.dose + ' — ' + medication.pills_per_dose + ' عدد',
      data: {
        medicationId: medication.id,
        medicationName: medication.name,
        dose: medication.dose,
        pillsPerDose: medication.pills_per_dose,
        type: 'snooze-reminder',
      },
      sound: 'default',
    },
    trigger: {
      seconds: 900,
    },
  });
  return id;
};

export const scheduleLowStockNotification = async (medication: Medication, remainingDays: number): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'دارو داره تموم میشه',
      body: medication.name + ' فقط ' + remainingDays + ' روز دیگه دارید.',
      data: {
        medicationId: medication.id,
        type: 'low-stock',
      },
    },
    trigger: null,
  });
};

export const cancelMedicationNotifications = async (medicationId: number): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const data = notification.content.data as any;
    if (data && data.medicationId === medicationId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const rescheduleAllNotifications = async (medications: Medication[]): Promise<void> => {
  await cancelAllNotifications();
  for (const medication of medications) {
    await scheduleMedicationNotifications(medication);
  }
};
