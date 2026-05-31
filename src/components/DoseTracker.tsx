import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay } from 'react-native-reanimated';
import { toPersianDigits } from '../utils/persian';
import { useTheme } from '../theme/ThemeContext';

interface DoseTrackerProps {
  total: number;
  taken: number;
  missed: number;
  percentage: number;
}

export const DoseTracker: React.FC<DoseTrackerProps> = ({ total, taken, missed, percentage }) => {
  const { theme, fontSize } = useTheme();
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withDelay(300, withTiming(percentage / 100, { duration: 800 }));
  }, [percentage]);

  const progressStyle = useAnimatedStyle(() => ({
    width: (progressWidth.value * 100) + '%',
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 2 }]}>آمار مصرف</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.primaryLight }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: theme.primary }, progressStyle]} />
        </View>
        <Text style={[styles.percentage, { color: theme.primary, fontSize: fontSize + 2 }]}>
          {toPersianDigits(percentage)}٪
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.statLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>خورده شده</Text>
          <Text style={[styles.statValue, { color: theme.text, fontSize: fontSize + 4 }]}>
            {toPersianDigits(taken)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: theme.danger }]} />
          <Text style={[styles.statLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>فراموش شده</Text>
          <Text style={[styles.statValue, { color: theme.text, fontSize: fontSize + 4 }]}>
            {toPersianDigits(missed)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: theme.primaryLight }]} />
          <Text style={[styles.statLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>کل دوزها</Text>
          <Text style={[styles.statValue, { color: theme.text, fontSize: fontSize + 4 }]}>
            {toPersianDigits(total)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: { fontFamily: 'Vazirmatn_Bold', textAlign: 'right', marginBottom: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  progressBar: { flex: 1, height: 14, borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  percentage: { fontFamily: 'Vazirmatn_Bold', minWidth: 50, textAlign: 'right' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statDot: { width: 12, height: 12, borderRadius: 6 },
  statLabel: { fontFamily: 'Vazirmatn' },
  statValue: { fontFamily: 'Vazirmatn_Bold' },
});
