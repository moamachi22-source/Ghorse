import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Medication } from '../database/medications';
import { formatTime, formatRemainingDays, toPersianDigits } from '../utils/persian';
import { isLowStock } from '../utils/calculations';

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

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const handleDelete = () => {
    Alert.alert(
      'حذف دارو',
      'آیا میخواید ' + medication.name + ' رو حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => onDelete(medication.id) },
      ]
    );
  };

  const lowStock = isLowStock(medication.total_pills, medication.pills_per_dose, medication.times.length, takenDoses);

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View style={[styles.card, lowStock && styles.cardLowStock]}>
            {lowStock && (
              <View style={styles.lowStockBanner}>
                <Text style={styles.lowStockText}>دارو داره تموم میشه</Text>
              </View>
            )}
            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.dose}>{medication.dose}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => onEdit(medication.id)}>
                  <Text style={styles.editButtonText}>ویرایش</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.timesContainer}>
              <Text style={styles.sectionLabel}>زمان مصرف:</Text>
              <View style={styles.timeChips}>
                {medication.times.map((time, i) => (
                  <View key={i} style={styles.timeChip}>
                    <Text style={styles.timeChipText}>{formatTime(time)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>هر بار</Text>
                <Text style={styles.footerValue}>{toPersianDigits(medication.pills_per_dose)} عدد</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>باقیمانده</Text>
                <Text style={[styles.footerValue, lowStock && styles.footerValueDanger]}>
                  {formatRemainingDays(remainingDays)}
                </Text>
              </View>
              <View style={styles.footerDivider} />
              <TouchableOpacity style={styles.takenButton} onPress={() => onMarkTaken(medication)}>
                <Text style={styles.takenButtonText}>خوردم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardLowStock: {
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },
  lowStockBanner: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  lowStockText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: 'Vazirmatn',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: { flex: 1 },
  medicationName: {
    fontSize: 20,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
    textAlign: 'right',
  },
  dose: {
    fontSize: 14,
    fontFamily: 'Vazirmatn',
    color: '#6C63FF',
    marginTop: 2,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#6C63FF',
    fontSize: 13,
    fontFamily: 'Vazirmatn',
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: 'Vazirmatn',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EFFF',
    marginVertical: 12,
  },
  timesContainer: { marginBottom: 12 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    textAlign: 'right',
    marginBottom: 8,
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  timeChip: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeChipText: {
    color: '#6C63FF',
    fontSize: 13,
    fontFamily: 'Vazirmatn',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 13,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  footerValueDanger: { color: '#FF6B6B' },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0F0',
  },
  takenButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  takenButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Vazirmatn_Bold',
  },
});
