import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { markDoseTaken, addDose, getDoseByScheduledTime } from '../database/doses';
import { getMedicationById } from '../database/medications';
import { scheduleSnoozeNotification } from './scheduler';

export interface NotificationData {
  medicationId: number;
  medicationName: string;
  dose: string;
  pillsPerDose: number;
  scheduledTime?: string;
  type: 'medication-reminder' | 'snooze-reminder' | 'low-stock';
}

export const handleNotificationReceived = (notification: Notifications.Notification): void => {
  const data = notification.request.content.data as NotificationData;
  if (!data) return;
  console.log('Notification received:', data.medicationName);
};

export const handleNotificationResponse = async (response: Notifications.NotificationResponse): Promise<void> => {
  const data = response.notification.request.content.data as NotificationData;
  if (!data) return;
  const actionId = response.actionIdentifier;
  if (actionId === 'MARK_TAKEN' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    await handleMarkTaken(data);
  } else if (actionId === 'SNOOZE') {
    await handleSnooze(data);
  }
};

const handleMarkTaken = async (data: NotificationData): Promise<void> => {
  try {
    const medication = getMedicationById(data.medicationId);
    if (!medication) return;
    const scheduledTime = data.scheduledTime ? data.scheduledTime : new Date().toISOString();
    let dose = getDoseByScheduledTime(data.medicationId, scheduledTime);
    if (!dose) {
      const doseId = addDose(data.medicationId, scheduledTime);
      markDoseTaken(doseId);
    } else {
      markDoseTaken(dose.id);
    }
    router.push('/(tabs)/');
  } catch (error) {
    console.error('Error marking dose as taken:', error);
  }
};

const handleSnooze = async (data: NotificationData): Promise<void> => {
  try {
    const medication = getMedicationById(data.medicationId);
    if (!medication) return;
    await scheduleSnoozeNotification(medication);
  } catch (error) {
    console.error('Error scheduling snooze:', error);
  }
};

export const registerNotificationActions = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync('medication-reminder', [
    {
      identifier: 'MARK_TAKEN',
      buttonTitle: 'خوردم',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'SNOOZE',
      buttonTitle: 'بعداً',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
};
