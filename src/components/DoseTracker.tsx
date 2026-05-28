import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { toPersianDigits } from '@/utils/persian';

interface DoseTrackerProps {
  total: number;
  taken: number;
  missed: number;
  percentage: number;
}

export const DoseTracker: React.FC<DoseTrackerProps> = ({
  total,
  taken,
  missed,
  percentage,
}) => {
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withTiming(percentage / 100, { duration: 800 })
    );
  }, [percentage]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>آمار مصرف</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.percentage}>
          {toPersianDigits(percentage)}٪
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#6C63FF' }]} />
          <Text style={styles.statLabel}>خورده شده</Text>
          <Text style={styles.statValue}>{toPersianDigits(taken)}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.statLabel}>فراموش شده</Text>
          <Text style={styles.statValue}>{toPersianDigits(missed)}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#E0E0F0' }]} />
          <Text style={styles.statLabel}>کل دوزها</Text>
          <Text style={styles.statValue}>{toPersianDigits(total)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
    textAlign: 'right',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#F0EFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 6,
  },
  percentage: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#6C63FF',
    minWidth: 45,
    textAlign: 'right',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
});
