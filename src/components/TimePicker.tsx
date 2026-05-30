import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { toPersianDigits } from '../utils/persian';

interface TimePickerProps {
  times: string[];
  onTimesChange: (times: string[]) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ times, onTimesChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

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
        <Text style={styles.label}>زمان‌های مصرف</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ افزودن زمان</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timesList}>
        {times.length === 0 && (
          <Text style={styles.emptyText}>هنوز زمانی اضافه نشده</Text>
        )}
        {times.map((time, index) => (
          <View key={index} style={styles.timeItem}>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveTime(time)}>
              <Text style={styles.removeButtonText}>x</Text>
            </TouchableOpacity>
            <Text style={styles.timeText}>{formatDisplayTime(time)}</Text>
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>انتخاب زمان</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>دقیقه</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {minutes.map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={[styles.pickerItem, selectedMinute === min && styles.pickerItemSelected]}
                      onPress={() => setSelectedMinute(min)}
                    >
                      <Text style={[styles.pickerItemText, selectedMinute === min && styles.pickerItemTextSelected]}>
                        {toPersianDigits(String(min).padStart(2, '0'))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.pickerSeparator}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ساعت</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.pickerItem, selectedHour === hour && styles.pickerItemSelected]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[styles.pickerItemText, selectedHour === hour && styles.pickerItemTextSelected]}>
                        {toPersianDigits(String(hour).padStart(2, '0'))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddTime}>
                <Text style={styles.confirmButtonText}>تأیید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 16, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A' },
  addButton: { backgroundColor: '#6C63FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Vazirmatn' },
  timesList: { gap: 8 },
  emptyText: { textAlign: 'center', color: '#9E9EA7', fontFamily: 'Vazirmatn', fontSize: 14, paddingVertical: 16 },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0EFFF',
    borderRadius: 12,
    padding: 12,
  },
  timeText: { fontSize: 16, fontFamily: 'Vazirmatn_Bold', color: '#6C63FF' },
  removeButton: { backgroundColor: '#FF6B6B', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: '#FFFFFF', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A', textAlign: 'center', marginBottom: 24 },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pickerColumn: { alignItems: 'center', flex: 1 },
  pickerLabel: { fontSize: 13, fontFamily: 'Vazirmatn', color: '#9E9EA7', marginBottom: 8 },
  pickerScroll: { height: 180 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginVertical: 2, alignItems: 'center' },
  pickerItemSelected: { backgroundColor: '#6C63FF' },
  pickerItemText: { fontSize: 20, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A' },
  pickerItemTextSelected: { color: '#FFFFFF' },
  pickerSeparator: { fontSize: 28, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#F0EFFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  cancelButtonText: { color: '#6C63FF', fontSize: 16, fontFamily: 'Vazirmatn_Bold' },
  confirmButton: { flex: 1, backgroundColor: '#6C63FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Vazirmatn_Bold' },
});
