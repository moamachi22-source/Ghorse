import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { toPersianDigits } from '../utils/persian';
import { useTheme } from '../theme/ThemeContext';

interface TimePickerProps {
  times: string[];
  onTimesChange: (times: string[]) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ times, onTimesChange }) => {
  const { theme, fontSize } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleAddTime = () => {
    const timeString = String(selectedHour).padStart(2, '0') + ':' + String(selectedMinute).padStart(2, '0');
    if (!times.includes(timeString)) {
      onTimesChange([...times, timeString].sort());
    }
    setModalVisible(false);
  };

  const handleRemoveTime = (time: string) => {
    onTimesChange(times.filter((t) => t !== time));
  };

  const formatDisplayTime = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour < 12 ? 'صبح' : hour < 17 ? 'ظهر' : 'شب';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return toPersianDigits(displayHour) + ':' + toPersianDigits(String(minute).padStart(2, '0')) + ' ' + period;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.text, fontSize }]}>زمان‌های مصرف</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.addButtonText, { fontSize }]}>+ افزودن زمان</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timesList}>
        {times.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textLight, fontSize }]}>
            هنوز زمانی اضافه نشده
          </Text>
        )}
        {times.map((time, index) => (
          <View key={index} style={[styles.timeItem, { backgroundColor: theme.primaryLight }]}>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.danger }]}
              onPress={() => handleRemoveTime(time)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={[styles.timeText, { color: theme.primary, fontSize: fontSize + 2 }]}>
              {formatDisplayTime(time)}
            </Text>
          </View>
        ))}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: fontSize + 4 }]}>
              انتخاب زمان
            </Text>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.textLight, fontSize }]}>دقیقه</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {minutes.map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={[
                        styles.pickerItem,
                        selectedMinute === min && { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setSelectedMinute(min)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: theme.text, fontSize: fontSize + 4 },
                        selectedMinute === min && { color: '#FFFFFF' },
                      ]}>
                        {toPersianDigits(String(min).padStart(2, '0'))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.pickerSeparator, { color: theme.text, fontSize: fontSize + 12 }]}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.textLight, fontSize }]}>ساعت</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: theme.text, fontSize: fontSize + 4 },
                        selectedHour === hour && { color: '#FFFFFF' },
                      ]}>
                        {toPersianDigits(String(hour).padStart(2, '0'))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={[styles.selectedTime, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.selectedTimeText, { color: theme.primary, fontSize: fontSize + 6 }]}>
                {toPersianDigits(String(selectedHour).padStart(2, '0'))}:{toPersianDigits(String(selectedMinute).padStart(2, '0'))}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.primaryLight }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.primary, fontSize }]}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                onPress={handleAddTime}
              >
                <Text style={[styles.confirmButtonText, { fontSize }]}>تأیید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontFamily: 'Vazirmatn_Bold' },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  addButtonText: { color: '#FFFFFF', fontFamily: 'Vazirmatn_Bold' },
  timesList: { gap: 8 },
  emptyText: { textAlign: 'center', fontFamily: 'Vazirmatn', paddingVertical: 16 },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
  },
  timeText: { fontFamily: 'Vazirmatn_Bold' },
  removeButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: '#FFFFFF', fontSize: 20, lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: 'Vazirmatn_Bold', textAlign: 'center', marginBottom: 24 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  pickerColumn: { alignItems: 'center', flex: 1 },
  pickerLabel: { fontFamily: 'Vazirmatn', marginBottom: 8 },
  pickerScroll: { height: 200 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginVertical: 2, alignItems: 'center', minWidth: 70 },
  pickerItemText: { fontFamily: 'Vazirmatn_Bold' },
  pickerSeparator: { fontFamily: 'Vazirmatn_Bold', marginBottom: 24 },
  selectedTime: { borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20 },
  selectedTimeText: { fontFamily: 'Vazirmatn_Bold' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  cancelButtonText: { fontFamily: 'Vazirmatn_Bold' },
  confirmButton: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontFamily: 'Vazirmatn_Bold' },
});
