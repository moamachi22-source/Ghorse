import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../../src/store/medicationStore';
import { MedicationCard } from '../../src/components/MedicationCard';
import { Medication } from '../../src/database/medications';
import { addDose, getDoseByScheduledTime, markDoseTaken, getAdherenceStats } from '../../src/database/doses';
import { scheduleMedicationNotifications, scheduleLowStockNotification } from '../../src/notifications/scheduler';
import { toPersianDigits } from '../../src/utils/persian';
import { isLowStock, getNextDoseTime } from '../../src/utils/calculations';

export default function HomeScreen() {
  const { medications, isLoading, loadMedications, deleteMedication, getRemainingDays } = useMedicationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [takenDosesMap, setTakenDosesMap] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      loadMedications();
      loadTakenDoses();
    }, [])
  );

  const loadTakenDoses = () => {
    const map: Record<number, number> = {};
    medications.forEach((med) => {
      const stats = getAdherenceStats(med.id);
      map[med.id] = stats.taken;
    });
    setTakenDosesMap(map);
  };

  useEffect(() => { loadTakenDoses(); }, [medications]);

  useEffect(() => { checkLowStockAlerts(); }, [medications]);

  const checkLowStockAlerts = async () => {
    for (const med of medications) {
      const remaining = getRemainingDays(med);
      const taken = takenDosesMap[med.id] ? takenDosesMap[med.id] : 0;
      if (isLowStock(med.total_pills, med.pills_per_dose, med.times.length, taken)) {
        await scheduleLowStockNotification(med, remaining);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadMedications();
    loadTakenDoses();
    setRefreshing(false);
  }, []);

  const handleEdit = (id: number) => { router.push('/medication/' + id); };

  const handleDelete = (id: number) => { deleteMedication(id); };

  const handleMarkTaken = (medication: Medication) => {
    const nextTime = getNextDoseTime(medication.times);
    if (!nextTime) return;
    const scheduledTime = new Date();
    const [hour, minute] = nextTime.split(':').map(Number);
    scheduledTime.setHours(hour, minute, 0, 0);
    const existing = getDoseByScheduledTime(medication.id, scheduledTime.toISOString());
    if (existing && existing.status === 'taken') {
      Alert.alert('توجه', 'این دوز قبلاً ثبت شده');
      return;
    }
    if (existing) {
      markDoseTaken(existing.id);
    } else {
      const doseId = addDose(medication.id, scheduledTime.toISOString());
      markDoseTaken(doseId);
    }
    loadTakenDoses();
    Alert.alert('ثبت شد', 'مصرف ' + medication.name + ' ثبت شد', [{ text: 'باشه' }]);
  };

  const getTodayDoseInfo = () => {
    const total = medications.reduce((sum, med) => sum + med.times.length, 0);
    const taken = Object.values(takenDosesMap).reduce((sum, val) => sum + val, 0);
    return { total, taken };
  };

  const { total: todayTotal, taken: todayTaken } = getTodayDoseInfo();

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💊</Text>
      <Text style={styles.emptyTitle}>هنوز داروی اضافه نشده</Text>
      <Text style={styles.emptySubtitle}>روی دکمه + بزنید تا اولین دارو رو اضافه کنید</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/medication/add')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>داروهای من</Text>
          <Text style={styles.headerSubtitle}>قرص — یادآور هوشمند</Text>
        </View>
      </Animated.View>

      {medications.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{toPersianDigits(medications.length)}</Text>
            <Text style={styles.summaryLabel}>دارو فعال</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{toPersianDigits(todayTaken)}/{toPersianDigits(todayTotal)}</Text>
            <Text style={styles.summaryLabel}>دوز امروز</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {todayTotal > 0 ? toPersianDigits(Math.round((todayTaken / todayTotal) * 100)) : toPersianDigits(0)}٪
            </Text>
            <Text style={styles.summaryLabel}>پایبندی</Text>
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
            takenDoses={takenDosesMap[item.id] ? takenDosesMap[item.id] : 0}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkTaken={handleMarkTaken}
            index={index}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, medications.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FF' },
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
  headerTitles: { alignItems: 'flex-end' },
  headerTitle: { fontSize: 24, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A' },
  headerSubtitle: { fontSize: 13, fontFamily: 'Vazirmatn', color: '#9E9EA7', marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 28, lineHeight: 32 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontFamily: 'Vazirmatn_Bold', color: '#FFFFFF' },
  summaryLabel: { fontSize: 12, fontFamily: 'Vazirmatn', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  listContent: { paddingVertical: 16, paddingBottom: 32 },
  listContentEmpty: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontFamily: 'Vazirmatn_Bold', color: '#2D2D3A', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, fontFamily: 'Vazirmatn', color: '#9E9EA7', textAlign: 'center', lineHeight: 24 },
});
