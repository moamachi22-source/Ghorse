import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllNotifications, rescheduleAllNotifications } from '@/notifications/scheduler';
import { getAllMedications } from '@/database/medications';
import { toPersianDigits } from '@/utils/persian';

const FONT_SIZE_KEY = 'setting_font_size';
const NOTIFICATIONS_KEY = 'setting_notifications';
const VIBRATION_KEY = 'setting_vibration';

type FontSize = 'small' | 'medium' | 'large';

interface Settings {
  fontSize: FontSize;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultSettings: Settings = {
  fontSize: 'medium',
  notificationsEnabled: true,
  vibrationEnabled: true,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const fontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
      const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const vibration = await AsyncStorage.getItem(VIBRATION_KEY);

      setSettings({
        fontSize: (fontSize as FontSize) ?? 'medium',
        notificationsEnabled: notifications !== 'false',
        vibrationEnabled: vibration !== 'false',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleFontSizeChange = async (size: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize: size }));
    await saveSetting(FONT_SIZE_KEY, size);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setSettings((prev) => ({ ...prev, notificationsEnabled: value }));
    await saveSetting(NOTIFICATIONS_KEY, String(value));

    if (value) {
      const medications = getAllMedications();
      await rescheduleAllNotifications(medications);
      Alert.alert('✅ فعال شد', 'نوتیفیکیشن‌ها دوباره فعال شدن');
    } else {
      await cancelAllNotifications();
      Alert.alert('🔕 غیرفعال شد', 'نوتیفیکیشن‌ها غیرفعال شدن');
    }
  };

  const handleVibrationToggle = async (value: boolean) => {
    setSettings((prev) => ({ ...prev, vibrationEnabled: value }));
    await saveSetting(VIBRATION_KEY, String(value));
  };

  const handleResetNotifications = async () => {
    Alert.alert(
      'بازنشانی آلارم‌ها',
      'همه آلارم‌ها دوباره تنظیم میشن. ادامه میدی؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'بله',
          onPress: async () => {
            const medications = getAllMedications();
            await rescheduleAllNotifications(medications);
            Alert.alert('✅ انجام شد', 'همه آلارم‌ها دوباره تنظیم شدن');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      '⚠️ حذف همه داده‌ها',
      'این کار همه داروها و تاریخچه مصرف رو پاک میکنه. برگشتی نیست!',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف همه',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            Alert.alert('✅ انجام شد', 'همه داده‌ها پاک شدن');
          },
        },
      ]
    );
  };

  const getFontSizeValue = (size: FontSize): number => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 20;
    }
  };

  if (isLoading) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>تنظیمات</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>اعلان‌ها</Text>
          <View style={styles.card}>

            <View style={styles.settingRow}>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#E0E0F0', true: '#6C63FF' }}
                thumbColor={
                  settings.notificationsEnabled ? '#FFFFFF' : '#F4F3F4'
                }
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>نوتیفیکیشن‌ها</Text>
                <Text style={styles.settingSubtitle}>
                  یادآوری زمان مصرف دارو
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: '#E0E0F0', true: '#6C63FF' }}
                thumbColor={
                  settings.vibrationEnabled ? '#FFFFFF' : '#F4F3F4'
                }
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>ویبره</Text>
                <Text style={styles.settingSubtitle}>
                  لرزش هنگام نوتیفیکیشن
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleResetNotifications}
            >
              <Text style={styles.actionArrow}>←</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>بازنشانی آلارم‌ها</Text>
                <Text style={styles.settingSubtitle}>
                  مثلاً بعد از ریستارت گوشی
                </Text>
              </View>
            </TouchableOpacity>

          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>نمایش</Text>
          <View style={styles.card}>
            <Text style={styles.settingTitle}>اندازه فونت</Text>
            <Text style={styles.settingSubtitle}>
              متن نمونه با اندازه انتخابی
            </Text>
            <Text
              style={[
                styles.fontPreview,
                { fontSize: getFontSizeValue(settings.fontSize) },
              ]}
            >
              وقت مصرف قرص متفورمین رسیده
            </Text>
            <View style={styles.fontSizeButtons}>
              {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeButton,
                    settings.fontSize === size &&
                      styles.fontSizeButtonActive,
                  ]}
                  onPress={() => handleFontSizeChange(size)}
                >
                  <Text
                    style={[
                      styles.fontSizeButtonText,
                      settings.fontSize === size &&
                        styles.fontSizeButtonTextActive,
                    ]}
                  >
                    {size === 'small'
                      ? 'کوچک'
                      : size === 'medium'
                      ? 'متوسط'
                      : 'بزرگ'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>درباره اپ</Text>
          <View style={styles.card}>

            <View style={styles.aboutRow}>
              <Text style={styles.aboutValue}>۱.۰.۰</Text>
              <Text style={styles.aboutLabel}>نسخه</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutRow}>
              <Text style={styles.aboutValue}>قرص</Text>
              <Text style={styles.aboutLabel}>نام اپ</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutRow}>
              <Text style={styles.aboutValue}>
                {Platform.OS === 'ios' ? 'iOS' : 'Android'}
              </Text>
              <Text style={styles.aboutLabel}>سیستم عامل</Text>
            </View>

          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>خطرناک</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearAllData}
            >
              <Text style={styles.dangerButtonText}>
                🗑 حذف همه داده‌ها
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ساخته شده با ❤️ برای سلامتی شما
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Vazirmatn_Bold',
    color: '#9E9EA7',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 4,
  },
  dangerCard: {
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: '#6C63FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EFFF',
    marginVertical: 4,
  },
  fontPreview: {
    fontFamily: 'Vazirmatn',
    color: '#6C63FF',
    textAlign: 'right',
    marginVertical: 12,
    backgroundColor: '#F0EFFF',
    padding: 12,
    borderRadius: 12,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#6C63FF',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontFamily: 'Vazirmatn_Bold',
    color: '#6C63FF',
  },
  fontSizeButtonTextActive: {
    color: '#FFFFFF',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 15,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  aboutValue: {
    fontSize: 15,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
  },
  dangerButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#FF6B6B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
  },
});
