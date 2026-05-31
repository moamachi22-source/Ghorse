import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Medication } from '../database/medications';
import { formatTime, formatRemainingDays, toPersianDigits } from '../utils/persian';
import { isLowStock } from '../utils/calculations';
import { useTheme } from '../theme/ThemeContext';

interface MedicationCardProps {
  medication: Medication;
  remainingDays: number;
  takenDoses: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkTaken: (medication: Medication) => void;
  index: number;
}

const getFrequencyLabel = (type: string): string => {
  switch (type) {
    case 'daily': return 'هر روز';
    case 'alternate': return 'یک روز در میان';
    case 'weekly': return 'هفتگی';
    case 'monthly': return 'ماهانه';
    case 'custom': return 'سفارشی';
    default: return 'هر روز';
  }
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  remainingDays,
  takenDoses,
  onEdit,
  onDelete,
  onMarkTaken,
  index,
}) => {
  const { theme, fontSize } = useTheme();
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
          <View style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
              borderColor: lowStock ? theme.danger : 'transparent',
              borderWidth: lowStock ? 1.5 : 0,
            }
          ]}>

            {lowStock && (
              <View style={[styles.lowStockBanner, { backgroundColor: theme.danger + '20' }]}>
                <Text style={[styles.lowStockText, { color: theme.danger, fontSize: fontSize - 2 }]}>
                  دارو داره تموم میشه
                </Text>
              </View>
            )}

            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <Text style={[styles.medicationName, { color: theme.text, fontSize: fontSize + 4 }]}>
                  {medication.name}
                </Text>
                <Text style={[styles.dose, { color: theme.primary, fontSize }]}>
                  {medication.dose}
                </Text>
                <View style={[styles.frequencyBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.frequencyText, { color: theme.primary, fontSize: fontSize - 3 }]}>
                    {getFrequencyLabel(medication.frequency_type)}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.primaryLight }]}
                  onPress={() => onEdit(medication.id)}
                >
                  <Text style={[styles.editButtonText, { color: theme.primary, fontSize: fontSize - 2 }]}>
                    ویرایش
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.danger + '20' }]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.danger, fontSize: fontSize - 2 }]}>
                    حذف
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {medication.notes && (
              <View style={[styles.notesContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.notesText, { color: theme.textLight, fontSize: fontSize - 2 }]}>
                  {medication.notes}
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: theme.primaryLight }]} />

            <View style={styles.timesContainer}>
              <Text style={[styles.sectionLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>
                زمان مصرف:
              </Text>
              <View style={styles.timeChips}>
                {medication.times.map((time, i) => (
                  <View key={i} style={[styles.timeChip, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.timeChipText, { color: theme.primary, fontSize: fontSize - 2 }]}>
                      {formatTime(time)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.footer, { backgroundColor: theme.background }]}>
              <View style={styles.footerItem}>
                <Text style={[styles.footerLabel, { color: theme.textLight, fontSize: fontSize - 4 }]}>
                  هر بار
                </Text>
                <Text style={[styles.footerValue, { color: theme.text, fontSize: fontSize - 2 }]}>
                  {toPersianDigits(medication.pills_per_dose)} عدد
                </Text>
              </View>
              <View style={[styles.footerDivider, { backgroundColor: theme.primaryLight }]} />
              <View style={styles.footerItem}>
                <Text style={[styles.footerLabel, { color: theme.textLight, fontSize: fontSize - 4 }]}>
                  باقیمانده
                </Text>
                <Text style={[
                  styles.footerValue,
                  { color: lowStock ? theme.danger : theme.text, fontSize: fontSize - 2 }
                ]}>
                  {formatRemainingDays(remainingDays)}
                </Text>
              </View>
              <View style={[styles.footerDivider, { backgroundColor: theme.primaryLight }]} />
              <TouchableOpacity
                style={[styles.takenButton, { backgroundColor: theme.primary }]}
                onPress={() => onMarkTaken(medication)}
              >
                <Text style={[styles.takenButtonText, { fontSize }]}>خوردم</Text>
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
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lowStockBanner: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  lowStockText: { fontFamily: 'Vazirmatn' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: { flex: 1 },
  medicationName: { fontFamily: 'Vazirmatn_Bold', textAlign: 'right' },
  dose: { fontFamily: 'Vazirmatn', marginTop: 2, textAlign: 'right' },
  frequencyBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  frequencyText: { fontFamily: 'Vazirmatn' },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  editButtonText: { fontFamily: 'Vazirmatn' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  deleteButtonText: { fontFamily: 'Vazirmatn' },
  notesContainer: { borderRadius: 10, padding: 10, marginTop: 10 },
  notesText: { fontFamily: 'Vazirmatn', textAlign: 'right', lineHeight: 22 },
  divider: { height: 1, marginVertical: 12 },
  timesContainer: { marginBottom: 12 },
  sectionLabel: { fontFamily: 'Vazirmatn', textAlign: 'right', marginBottom: 8 },
  timeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  timeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timeChipText: { fontFamily: 'Vazirmatn' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
  },
  footerItem: { alignItems: 'center', flex: 1 },
  footerLabel: { fontFamily: 'Vazirmatn', marginBottom: 4 },
  footerValue: { fontFamily: 'Vazirmatn_Bold' },
  footerDivider: { width: 1, height: 30, marginVertical: 4 },
  takenButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flex: 1, alignItems: 'center' },
  takenButtonText: { color: '#FFFFFF', fontFamily: 'Vazirmatn_Bold' },
});
