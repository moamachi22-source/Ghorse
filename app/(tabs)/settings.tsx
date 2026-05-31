import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { themes } from '../../src/theme/index';
import { toPersianDigits } from '../../src/utils/persian';

const FONT_SIZES = [
  { label: 'خیلی کوچک', value: 13 },
  { label: 'کوچک', value: 15 },
  { label: 'متوسط', value: 17 },
  { label: 'بزرگ', value: 20 },
  { label: 'خیلی بزرگ', value: 24 },
];

export default function SettingsScreen() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: fontSize + 8 }]}>تنظیمات</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            اندازه متن
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.previewText, { color: theme.primary, fontSize, backgroundColor: theme.primaryLight }]}>
              وقت مصرف قرص متفورمین رسیده
            </Text>
            <View style={styles.fontSizeButtons}>
              {FONT_SIZES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.fontSizeButton,
                    { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                    fontSize === item.value && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setFontSize(item.value)}
                >
                  <Text style={[
                    styles.fontSizeButtonText,
                    { color: theme.primary },
                    fontSize === item.value && { color: '#FFFFFF' },
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            تم رنگی
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={styles.themesGrid}>
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themeButton,
                    { backgroundColor: t.primary },
                    theme.id === t.id && styles.themeButtonActive,
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  <Text style={[styles.themeButtonText, { fontSize: fontSize - 4 }]}>
                    {t.name}
                  </Text>
                  {theme.id === t.id && (
                    <Text style={styles.themeCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            درباره اپ
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutValue, { color: theme.textLight, fontSize }]}>۱.۰.۰</Text>
              <Text style={[styles.aboutLabel, { color: theme.text, fontSize }]}>نسخه</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.primaryLight }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutValue, { color: theme.textLight, fontSize }]}>قرص</Text>
              <Text style={[styles.aboutLabel, { color: theme.text, fontSize }]}>نام اپ</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.primaryLight }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutValue, { color: theme.textLight, fontSize }]}>
                {Platform.OS === 'ios' ? 'iOS' : 'Android'}
              </Text>
              <Text style={[styles.aboutLabel, { color: theme.text, fontSize }]}>سیستم عامل</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            ساخته شده با ❤️ برای سلامتی شما
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-end',
  },
  headerTitle: { fontFamily: 'Vazirmatn_Bold' },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 8 },
  sectionTitle: {
    fontFamily: 'Vazirmatn_Bold',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  previewText: {
    fontFamily: 'Vazirmatn',
    textAlign: 'right',
    padding: 12,
    borderRadius: 12,
  },
  fontSizeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  fontSizeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  fontSizeButtonText: { fontFamily: 'Vazirmatn_Bold', fontSize: 13 },
  themesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  themeButtonActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  themeButtonText: { color: '#FFFFFF', fontFamily: 'Vazirmatn_Bold' },
  themeCheck: { color: '#FFFFFF', fontSize: 16, marginTop: 2 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  aboutLabel: { fontFamily: 'Vazirmatn_Bold' },
  aboutValue: { fontFamily: 'Vazirmatn' },
  divider: { height: 1, marginVertical: 4 },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontFamily: 'Vazirmatn' },
});
