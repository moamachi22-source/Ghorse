import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../../src/store/medicationStore';
import { MedicationCard } from '../../src/components/MedicationCard';
import { Medication } from '../../src/database/medications';
import { addDose, getDoseByScheduledTime, markDoseTaken } from '../../src/database/doses';
import { toPersianDigits } from '../../src/utils/persian';
import { getNextDoseTime } from '../../src/utils/calculations';
import { useTheme } from '../../src/theme/ThemeContext';
import { RewardAnimation } from '../../src/components/RewardAnimation';

export default function HomeScreen() {
  const { medications, isLoading, loadMedications, deleteMedication, getRemainingDays, takenDosesMap } = useMedicationStore();
  const { theme, fontSize } = useTheme();
  const [rewardVisible, setRewardVisible] = useState(false);
  const [rewardPercentage, setRewardPercentage] = useState(0);

  useFocusEffect(useCallback(() => { loadMedications(); }, []));

  const handleEdit = (id: number) => { router.push('/medication/' + id); };
  const handleDelete = async (id: number) => { await deleteMedication(id); };

  const handleMarkTaken = async (medication: Medication) => {
    const nextTime = getNextDoseTime(medication.times);
    if (!nextTime) return;
    const scheduledTime = new Date();
    const [hour, minute] = nextTime.split(':').map(Number);
    scheduledTime.setHours(hour, minute, 0, 0);
    try {
      const existing = await getDoseByScheduledTime(medication.id, scheduledTime.toISOString());
      if (existing && existing.status === 'taken') {
        Alert.alert('توجه', 'این دوز قبلاً ثبت شده');
        return;
      }
      if (existing) {
        await markDoseTaken(existing.id);
      } else {
        const doseId = await addDose(medication.id, scheduledTime.toISOString());
        await markDoseTaken(doseId);
      }
      await loadMedications();
      const todayTotal = medications.reduce((sum, med) => sum + med.times.length, 0);
      const todayTakenNew = Object.values(takenDosesMap).reduce((sum, val) => sum + val, 0) + 1;
      const percentage = todayTotal > 0 ? Math.round((todayTakenNew / todayTotal) * 100) : 0;
      setRewardPercentage(percentage);
      setRewardVisible(true);
    } catch (e) {
      Alert.alert('خطا', 'مشکلی در ثبت پیش اومد');
    }
  };

  const todayTotal = medications.reduce((sum, med) => sum + med.times.length, 0);
  const todayTaken = Object.values(takenDosesMap).reduce((sum, val) => sum + val, 0);

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💊</Text>
      <Text style={[styles.emptyTitle, { color: theme.text, fontSize: fontSize + 4 }]}>
        هنوز داروی اضافه نشده
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textLight, fontSize }]}>
        روی دکمه + پایین صفحه بزنید
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: theme.text, fontSize: fontSize + 8 }]}>داروهای من</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            قرص — یادآور هوشمند
          </Text>
        </View>
      </Animated.View>

      {medications.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.summaryCard, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontSize: fontSize + 8 }]}>{toPersianDigits(medications.length)}</Text>
            <Text style={[styles.summaryLabel, { fontSize: fontSize - 2 }]}>دارو فعال</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontSize: fontSize + 8 }]}>
              {toPersianDigits(todayTaken)}/{toPersianDigits(todayTotal)}
            </Text>
            <Text style={[styles.summaryLabel, { fontSize: fontSize - 2 }]}>دوز امروز</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontSize: fontSize + 8 }]}>
              {todayTotal > 0 ? toPersianDigits(Math.round((todayTaken / todayTotal) * 100)) : toPersianDigits(0)}٪
            </Text>
            <Text style={[styles.summaryLabel, { fontSize: fontSize - 2 }]}>پایبندی</Text>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={medications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <MedicationCard
            medication={item}
            remainingDays={getRemainingDays(item)}
            takenDoses={takenDosesMap[item.id] ?? 0}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkTaken={handleMarkTaken}
            index={index}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, medications.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadMedications} tintColor={theme.primary} />}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}
        onPress={() => router.push('/medication/add')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <RewardAnimation
        visible={rewardVisible}
        percentage={rewardPercentage}
        streak={1}
        onClose={() => setRewardVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-end',
  },
  headerTitles: { alignItems: 'flex-end' },
  headerTitle: { fontFamily: 'Vazirmatn_Bold' },
  headerSubtitle: { fontFamily: 'Vazirmatn', marginTop: 2 },
  summaryCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontFamily: 'Vazirmatn_Bold', color: '#FFFFFF' },
  summaryLabel: { fontFamily: 'Vazirmatn', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  listContent: { paddingVertical: 16, paddingBottom: 120 },
  listContentEmpty: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Vazirmatn_Bold', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Vazirmatn', textAlign: 'center', lineHeight: 24 },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: { color: '#FFFFFF', fontSize: 36, lineHeight: 42 },
});
