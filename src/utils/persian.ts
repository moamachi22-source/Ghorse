export const toPersianDigits = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

export const toEnglishDigits = (str: string): string => {
  return str
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
};

export const formatTime = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour < 12 ? 'صبح' : hour < 17 ? 'ظهر' : 'شب';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return toPersianDigits(displayHour) + ':' + toPersianDigits(String(minute).padStart(2, '0')) + ' ' + period;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatRemainingDays = (days: number): string => {
  if (days === 0) return 'امروز تموم میشه';
  if (days === 1) return 'فردا تموم میشه';
  return toPersianDigits(days) + ' روز دیگه';
};

export const getShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const getDayName = (date: Date): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
  } catch (e) {
    return '';
  }
};

export const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
};
