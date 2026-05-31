import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { themes } from '../../src/theme/index';

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
            {FONT_SIZES.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.listItem,
                  { borderBottomColor: theme.primaryLight },
                  fontSize === item.value && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => setFontSize(item.value)}
              >
                <View style={[
                  styles.checkCircle,
                  { borderColor: theme.primary },
                  fontSize === item.value && { backgroundColor: theme.primary },
                ]}>
                  {fontSize === item.value && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.listItemText, { color: theme.text, fontSize: item.value }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            تم رنگی
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            {themes.map((t, index) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeListItem,
                  { borderBottomColor: theme.primaryLight },
                  index === themes.length - 1 && { borderBottomWidth: 0 },
                  theme.id === t.id && { backgroundColor: t.primaryLight },
                ]}
                onPress={() => setTheme(t.id)}
              >
                <View style={[
                  styles.checkCircle,
                  { borderColor: t.primary },
                  theme.id === t.id && { backgroundColor: t.primary },
                ]}>
                  {theme.id === t.id && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[styles.listItemText, { color: theme.text, fontSize }]}>
                    {t.name}
                  </Text>
                  <View style={styles.colorSwatches}>
                    <View style={[styles.swatch, { backgroundColor: t.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: t.primaryLight }]} />
                    <View style={[styles.swatch, { backgroundColor: t.background }]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            درباره اپ
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={[styles.aboutRow, { borderBottomColor: theme.primaryLight }]}>
              <Text style={[styles.aboutValue, { color: theme.textLight, fontSize }]}>۱.۰.۰</Text>
              <Text style={[styles.aboutLabel, { color: theme.text, fontSize }]}>نسخه</Text>
            </View>
            <View style={[styles.aboutRow, { borderBottomColor: theme.primaryLight }]}>
              <Text style={[styles.aboutValue, { color: theme.textLight, fontSize }]}>قرص</Text>
              <Text style={[styles.aboutLabel, { color: theme.text, fontSize }]}>نام اپ</Text>
            </View>
            <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
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
  scrollContent: { padding: 16, paddingBottom: 100, gap: 8 },
  sectionTitle: {
    fontFamily: 'Vazirmatn_Bold',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  themeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  listItemText: { fontFamily: 'Vazirmatn', flex: 1, textAlign: 'right' },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  themeInfo: { flex: 1, alignItems: 'flex-end', gap: 6 },
  colorSwatches: { flexDirection: 'row', gap: 4 },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  aboutLabel: { fontFamily: 'Vazirmatn_Bold' },
  aboutValue: { fontFamily: 'Vazirmatn' },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontFamily: 'Vazirmatn' },
});
