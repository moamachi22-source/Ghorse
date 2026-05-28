import { Medication } from '@/database/medications';

export const calculateRemainingDays = (
  totalPills: number,
  pillsPerDose: number,
  timesPerDay: number,
  takenDoses: number
): number => {
  const pillsPerDay = pillsPerDose * timesPerDay;
  if (pillsPerDay === 0) return 0;

  const takenPills = takenDoses * pillsPerDose;
  const remainingPills = totalPills - takenPills;

  return Math.max(0, Math.floor(remainingPills / pillsPerDay));
};

export const calculateEndDate = (
  startDate: string,
  totalPills: number,
  pillsPerDose: number,
  timesPerDay: number
): Date => {
  const pillsPerDay = pillsPerDose * timesPerDay;
  if (pillsPerDay === 0) return new Date(startDate);

  const totalDays = Math.floor(totalPills / pillsPerDay);
  const start = new Date(startDate);
  start.setDate(start.getDate() + totalDays);

  return start;
};

export const isLowStock = (
  totalPills: number,
  pillsPerDose: number,
  timesPerDay: number,
  takenDoses: number,
  warningDays: number = 3
): boolean => {
  const remaining = calculateRemainingDays(
    totalPills,
    pillsPerDose,
    timesPerDay,
    takenDoses
  );
  return remaining <= warningDays && remaining >= 0;
};

export const getNextDoseTime = (times: string[]): string | null => {
  if (!times || times.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const sortedTimes = [...times].sort((a, b) => {
    const [aH, aM] = a.split(':').map(Number);
    const [bH, bM] = b.split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });

  for (const time of sortedTimes) {
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    if (totalMinutes > currentTotalMinutes) {
      return time;
    }
  }

  return sortedTimes[0];
};

export const buildScheduledDateTime = (
  date: Date,
  time: string
): Date => {
  const [hour, minute] = time.split(':').map(Number);
  const scheduled = new Date(date);
  scheduled.setHours(hour, minute, 0, 0);
  return scheduled;
};
