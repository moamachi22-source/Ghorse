import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { toPersianDigits } from '../utils/persian';

interface RewardAnimationProps {
  visible: boolean;
  percentage: number;
  streak: number;
  onClose: () => void;
}

export const RewardAnimation: React.FC<RewardAnimationProps> = ({
  visible,
  percentage,
  streak,
  onClose,
}) => {
  const { theme, fontSize } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const starScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 8 });
      opacity.value = withTiming(1, { duration: 300 });
      starScale.value = withDelay(300, withSpring(1, { damping: 6 }));
      setTimeout(() => { runOnJS(onClose)(); }, 3000);
    } else {
      scale.value = withTiming(0);
      opacity.value = withTiming(0);
      starScale.value = withTiming(0);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const getMessage = () => {
    if (percentage === 100) return 'عالی! همه داروها رو خوردی! 🏆';
    if (percentage >= 80) return 'آفرین! خیلی خوب پیش میری! 🌟';
    if (percentage >= 60) return 'دارو رو ثبت کردی، ادامه بده! 💪';
    return 'دارو خوردی، سلامتی! ✅';
  };

  const getEmoji = () => {
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '⭐';
    if (percentage >= 60) return '💪';
    return '✅';
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { backgroundColor: theme.card }, containerStyle]}>
          <Animated.Text style={[styles.emoji, starStyle]}>
            {getEmoji()}
          </Animated.Text>
          <Text style={[styles.message, { color: theme.text, fontSize: fontSize + 2 }]}>
            {getMessage()}
          </Text>
          {streak > 1 && (
            <View style={[styles.streakBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.streakText, { color: theme.primary, fontSize }]}>
                {toPersianDigits(streak)} روز متوالی 🔥
              </Text>
            </View>
          )}
          <View style={[styles.progressBar, { backgroundColor: theme.primaryLight }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: theme.primary, width: percentage + '%' },
              ]}
            />
          </View>
          <Text style={[styles.percentageText, { color: theme.primary, fontSize }]}>
            {toPersianDigits(percentage)}٪ پایبندی امروز
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  message: { fontFamily: 'Vazirmatn_Bold', textAlign: 'center', marginBottom: 16 },
  streakBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  streakText: { fontFamily: 'Vazirmatn_Bold' },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 6 },
  percentageText: { fontFamily: 'Vazirmatn_Bold' },
});
