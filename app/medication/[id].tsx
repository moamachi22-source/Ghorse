import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../../src/store/medicationStore';
import { getMedicationById } from '../../src/database/medications';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioRecorder } from '../../src/components/AudioRecorder';
import { DoseTracker } from '../../src/components/DoseTracker';
import { getAdherenceStats } from '../../src/database/doses';
import { scheduleMedicationNotifications, cancelMedicationNotifications } from '../../src/notifications/scheduler';
import { toEnglishDigits } from '../../src/utils/persian';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateMedication, deleteMedication } = useMedicationStore();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [totalPills, setTotalPills] = useState('');
  const [pillsPerDose, setPillsPerDose] = useState('1');
  const [times, setTimes] = useState<string[]>([]);
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, taken: 0, missed: 0, percentage: 0 });

  useEffect(() => { if (id) loadMedication(); }, [id]);

  const loadMedication = () => {
    try {
      const medication = getMedicationById(Number(id));
      if (!medication) {
        Alert.alert('خطا', 'دارو پیدا نشد');
        router.back();
        return;
      }
      setName(medication.name);
      setDose(medication.dose);
      setTotalPills(String(medication.total_pills));
      setPillsPerDose(String(medication.pills_per_dose));
      setTimes(medication.times);
      setAudioUri(medication.audio_uri);
      setStats(getAdherenceStats(Number(id)));
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در بارگذاری پیش اومد');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

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
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      const medicationId = Number(id);
      updateMedication(medicationId, {
        name: name.trim(),
        dose: dose.trim(),
        total_pills: Number(toEnglishDigits(totalPills)),
        pills_per_dose: Number(toEnglishDigits(pillsPerDose)),
        start_date: new Date().toISOString().split('T')[0],
        times,
        audio_uri: audioUri,
      });
      await cancelMedicationNotifications(medicationId);
      const updated = getMedicationById(medicationId);
      if (updated) {
        await scheduleMedicationNotifications(updated);
      }
      Alert.alert(
        'ذخیره شد',
        name + ' با موفقیت ویرایش شد',
        [{ text: 'باشه', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در ذخیره پیش اومد');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف دارو',
      'آیا مطمئنی که میخوای ' + name + ' رو حذف کنی؟ تاریخچه مصرف هم پاک میشه.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await cancelMedicationNotifications(Number(id));
            deleteMedication(Number(id));
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity style={styles.deleteHeaderButton} onPress={handleDelete}>
            <Text style={styles.deleteHeaderButtonText}>حذف</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ویرایش دارو</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>لغو</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <DoseTracker
              total={stats.total}
              taken={stats.taken}
              missed={stats.missed}
              percentage={stats.percentage}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>اطلاعات دارو</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نام دارو *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="مثلاً: متفورمین"
                  placeholderTextColor="#C0C0CF"
                  textAlign="right"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>دوز *</Text>
                <TextInput
                  style={styles.input}
                  value={dose}
                  onChangeText={setDose}
                  placeholder="مثلاً: 500mg"
                  placeholderTextColor="#C0C0CF"
                  textAlign="right"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>کل قرص‌ها *</Text>
                  <TextInput
                    style={styles.input}
                    value={totalPills}
                    onChangeText={setTotalPills}
                    placeholder="30"
                    placeholderTextColor="#C0C0CF"
                    keyboardType="number-pad"
                    textAlign="right"
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.rowSpacer} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>هر بار چند تا *</Text>
                  <TextInput
                    style={styles.input}
                    value={pillsPerDose}
                    onChangeText={setPillsPerDose}
                    placeholder="1"
                    placeholderTextColor="#C0C0CF"
                    keyboardType="number-pad"
                    textAlign="right"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>زمان‌بندی</Text>
              <TimePicker times={times} onTimesChange={setTimes} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>صدای یادآوری</Text>
              <AudioRecorder audioUri={audioUri} onAudioChange={setAudioUri} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
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
  container: { flex: 1, backgroundColor: '#F8F8FF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A' },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F0EFFF' },
  cancelButtonText: { fontSize: 15, fontFamily: 'Vazirmatn', color: '#6C63FF' },
  deleteHeaderButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF0F0' },
  deleteHeaderButtonText: { fontSize: 15, fontFamily: 'Vazirmatn', color: '#FF6B6B' },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A', textAlign: 'right', marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A', textAlign: 'right' },
  input: {
    backgroundColor: '#F8F8FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Vazirmatn',
    color: '#2D2D3A',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowSpacer: { width: 12 },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 18, fontFamily: 'Vazirmatn_Bold', color: '#FFFFFF' },
  bottomSpacing: { height: 20 },
});
