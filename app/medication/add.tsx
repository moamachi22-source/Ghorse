import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../../src/store/medicationStore';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioRecorder } from '../../src/components/AudioRecorder';
import { FrequencyPicker, FrequencyType } from '../../src/components/FrequencyPicker';
import { toEnglishDigits } from '../../src/utils/persian';
import { useTheme } from '../../src/theme/ThemeContext';

export default function AddMedicationScreen() {
  const { addMedication } = useMedicationStore();
  const { theme, fontSize } = useTheme();

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [totalPills, setTotalPills] = useState('');
  const [pillsPerDose, setPillsPerDose] = useState('1');
  const [times, setTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([]);
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('خطا', 'لطفاً نام دارو رو وارد کنید');
      return false;
    }
    if (!dose.trim()) {
      Alert.alert('خطا', 'لطفاً دوز دارو رو وارد کنید');
      return false;
    }
    if (!totalPills || isNaN(Number(toEnglishDigits(totalPills)))) {
      Alert.alert('خطا', 'لطفاً تعداد کل قرص‌ها رو وارد کنید');
      return false;
    }
    if (!pillsPerDose || isNaN(Number(toEnglishDigits(pillsPerDose)))) {
      Alert.alert('خطا', 'لطفاً تعداد قرص در هر بار رو وارد کنید');
      return false;
    }
    if (times.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یه زمان مصرف اضافه کنید');
      return false;
    }
    if (frequencyType === 'weekly' && frequencyDays.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یه روز از هفته انتخاب کنید');
      return false;
    }
    if (frequencyType === 'monthly' && frequencyDays.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یه روز از ماه انتخاب کنید');
      return false;
    }
    if (frequencyType === 'custom' && frequencyDays.length === 0) {
      Alert.alert('خطا', 'لطفاً فاصله مصرف رو انتخاب کنید');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      const id = await addMedication({
        name: name.trim(),
        dose: dose.trim(),
        total_pills: Number(toEnglishDigits(totalPills)),
        pills_per_dose: Number(toEnglishDigits(pillsPerDose)),
        start_date: new Date().toISOString().split('T')[0],
        times,
        frequency_type: frequencyType,
        frequency_days: frequencyDays,
        notes: notes.trim() || undefined,
        audio_uri: audioUri,
      });
      if (id > 0) {
        Alert.alert(
          'ذخیره شد',
          name + ' با موفقیت اضافه شد',
          [{ text: 'باشه', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('خطا', 'مشکلی در ذخیره پیش اومد');
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی پیش اومد');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.primaryLight }]} onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: theme.primary, fontSize }]}>لغو</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text, fontSize: fontSize + 4 }]}>دارو جدید</Text>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontSize: fontSize + 2 }]}>اطلاعات دارو</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text, fontSize }]}>نام دارو *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.primaryLight, color: theme.text, fontSize }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="مثلاً: متفورمین"
                  placeholderTextColor={theme.textLight}
                  textAlign="right"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text, fontSize }]}>دوز *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.primaryLight, color: theme.text, fontSize }]}
                  value={dose}
                  onChangeText={setDose}
                  placeholder="مثلاً: 500mg"
                  placeholderTextColor={theme.textLight}
                  textAlign="right"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text, fontSize }]}>کل قرص‌ها *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.primaryLight, color: theme.text, fontSize }]}
                    value={totalPills}
                    onChangeText={setTotalPills}
                    placeholder="30"
                    placeholderTextColor={theme.textLight}
                    keyboardType="number-pad"
                    textAlign="right"
                  />
                </View>
                <View style={styles.rowSpacer} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text, fontSize }]}>هر بار چند تا *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.primaryLight, color: theme.text, fontSize }]}
                    value={pillsPerDose}
                    onChangeText={setPillsPerDose}
                    placeholder="1"
                    placeholderTextColor={theme.textLight}
                    keyboardType="number-pad"
                    textAlign="right"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text, fontSize }]}>توضیحات (اختیاری)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, { backgroundColor: theme.background, borderColor: theme.primaryLight, color: theme.text, fontSize }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="مثلاً: همراه غذا مصرف شود"
                  placeholderTextColor={theme.textLight}
                  textAlign="right"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontSize: fontSize + 2 }]}>دوره مصرف</Text>
              <FrequencyPicker
                frequencyType={frequencyType}
                frequencyDays={frequencyDays}
                onFrequencyTypeChange={setFrequencyType}
                onFrequencyDaysChange={setFrequencyDays}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontSize: fontSize + 2 }]}>زمان‌بندی</Text>
              <TimePicker times={times} onTimesChange={setTimes} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontSize: fontSize + 2 }]}>صدای یادآوری</Text>
              <AudioRecorder audioUri={audioUri} onAudioChange={setAudioUri} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={[styles.saveButtonText, { fontSize: fontSize + 2 }]}>
                {isSaving ? 'در حال ذخیره...' : 'ذخیره دارو'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: { fontFamily: 'Vazirmatn_Bold' },
  headerPlaceholder: { width: 48 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  cancelButtonText: { fontFamily: 'Vazirmatn' },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  cardTitle: { fontFamily: 'Vazirmatn_Bold', textAlign: 'right', marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontFamily: 'Vazirmatn_Bold', textAlign: 'right' },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Vazirmatn',
    borderWidth: 1.5,
  },
  notesInput: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowSpacer: { width: 12 },
  saveButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontFamily: 'Vazirmatn_Bold', color: '#FFFFFF' },
  bottomSpacing: { height: 40 },
});
