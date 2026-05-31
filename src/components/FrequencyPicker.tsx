import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { toPersianDigits } from '../utils/persian';

export type FrequencyType = 'daily' | 'alternate' | 'weekly' | 'monthly' | 'custom';

interface FrequencyPickerProps {
  frequencyType: FrequencyType;
  frequencyDays: number[];
  onFrequencyTypeChange: (type: FrequencyType) => void;
  onFrequencyDaysChange: (days: number[]) => void;
}

const WEEK_DAYS = [
  { id: 6, name: 'ش' },
  { id: 0, name: 'ی' },
  { id: 1, name: 'د' },
  { id: 2, name: 'س' },
  { id: 3, name: 'چ' },
  { id: 4, name: 'پ' },
  { id: 5, name: 'ج' },
];

export const FrequencyPicker: React.FC<FrequencyPickerProps> = ({
  frequencyType,
  frequencyDays,
  onFrequencyTypeChange,
  onFrequencyDaysChange,
}) => {
  const { theme, fontSize } = useTheme();

  const frequencyOptions = [
    { id: 'daily', label: 'هر روز' },
    { id: 'alternate', label: 'یک روز در میان' },
    { id: 'weekly', label: 'روزهای هفته' },
    { id: 'monthly', label: 'ماهانه' },
    { id: 'custom', label: 'سفارشی' },
  ];

  const toggleDay = (dayId: number) => {
    if (frequencyDays.includes(dayId)) {
      onFrequencyDaysChange(frequencyDays.filter((d) => d !== dayId));
    } else {
      onFrequencyDaysChange([...frequencyDays, dayId].sort());
    }
  };

  const toggleMonthDay = (day: number) => {
    if (frequencyDays.includes(day)) {
      onFrequencyDaysChange(frequencyDays.filter((d) => d !== day));
    } else {
      onFrequencyDaysChange([...frequencyDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text, fontSize }]}>دوره مصرف</Text>

      <View style={styles.optionsGrid}>
        {frequencyOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              { borderColor: theme.primary, backgroundColor: theme.card },
              frequencyType === option.id && { backgroundColor: theme.primary },
            ]}
            onPress={() => onFrequencyTypeChange(option.id as FrequencyType)}
          >
            <Text
              style={[
                styles.optionText,
                { color: theme.primary, fontSize: fontSize - 2 },
                frequencyType === option.id && { color: '#FFFFFF' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequencyType === 'weekly' && (
        <View style={styles.weekDaysContainer}>
          <Text style={[styles.subLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            روزهای هفته رو انتخاب کن:
          </Text>
          <View style={styles.weekDays}>
            {WEEK_DAYS.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  { borderColor: theme.primary, backgroundColor: theme.card },
                  frequencyDays.includes(day.id) && { backgroundColor: theme.primary },
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: theme.primary, fontSize: fontSize - 2 },
                    frequencyDays.includes(day.id) && { color: '#FFFFFF' },
                  ]}
                >
                  {day.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {frequencyType === 'monthly' && (
        <View style={styles.monthDaysContainer}>
          <Text style={[styles.subLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            روزهای ماه رو انتخاب کن:
          </Text>
          <View style={styles.monthDays}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.monthDayButton,
                  { borderColor: theme.primary, backgroundColor: theme.card },
                  frequencyDays.includes(day) && { backgroundColor: theme.primary },
                ]}
                onPress={() => toggleMonthDay(day)}
              >
                <Text
                  style={[
                    styles.monthDayText,
                    { color: theme.primary, fontSize: fontSize - 4 },
                    frequencyDays.includes(day) && { color: '#FFFFFF' },
                  ]}
                >
                  {toPersianDigits(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {frequencyType === 'custom' && (
        <View style={styles.customContainer}>
          <Text style={[styles.subLabel, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            هر چند روز یک بار؟
          </Text>
          <View style={styles.customDays}>
            {[2, 3, 4, 5, 6, 7, 10, 14].map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.customDayButton,
                  { borderColor: theme.primary, backgroundColor: theme.card },
                  frequencyDays[0] === day && { backgroundColor: theme.primary },
                ]}
                onPress={() => onFrequencyDaysChange([day])}
              >
                <Text
                  style={[
                    styles.customDayText,
                    { color: theme.primary, fontSize: fontSize - 2 },
                    frequencyDays[0] === day && { color: '#FFFFFF' },
                  ]}
                >
                  {toPersianDigits(day)} روز
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {frequencyType === 'alternate' && (
        <Text style={[styles.infoText, { color: theme.textLight, fontSize: fontSize - 2 }]}>
          دارو یک روز در میان مصرف میشه
        </Text>
      )}

      {frequencyType === 'daily' && (
        <Text style={[styles.infoText, { color: theme.textLight, fontSize: fontSize - 2 }]}>
          دارو هر روز مصرف میشه
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontFamily: 'Vazirmatn_Bold', textAlign: 'right', marginBottom: 12 },
  subLabel: { fontFamily: 'Vazirmatn', textAlign: 'right', marginBottom: 8, marginTop: 12 },
  infoText: { fontFamily: 'Vazirmatn', textAlign: 'right', marginTop: 8, fontStyle: 'italic' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: { fontFamily: 'Vazirmatn_Bold' },
  weekDaysContainer: { marginTop: 8 },
  weekDays: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontFamily: 'Vazirmatn_Bold' },
  monthDaysContainer: { marginTop: 8 },
  monthDays: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  monthDayButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayText: { fontFamily: 'Vazirmatn_Bold' },
  customContainer: { marginTop: 8 },
  customDays: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  customDayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  customDayText: { fontFamily: 'Vazirmatn_Bold' },
});
