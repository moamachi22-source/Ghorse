import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Medication } from '@/database/medications';
import { formatTime, formatRemainingDays, toPersianDigits } from '@/utils/persian';
import { isLowStock } from '@/utils/calculations';

interface MedicationCardProps {
  medication: Medication;
  remainingDays: number;
  takenDoses: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkTaken: (medication: Medication) => void;
  index: number;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  remainingDays,
  takenDoses,
  onEdit,
  onDelete,
  onMarkTaken,
  index,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
