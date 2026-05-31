import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllMedications, Medication } from '../../src/database/medications';
import { getDosesByMedication, Dose, getAdherenceStats } from '../../src/database/doses';
import { DoseTracker } from '../../src/components/DoseTracker';
import { toPersianDigits, formatTime, getShortDate } from '../../src/utils/persian';
import { useTheme } from '../../src/theme/ThemeContext';

interface MedicationWithStats {
  medication: Medication;
  doses: Dose[];
  stats: { total: number; taken: number; missed: number; percentage: number };
}

export default function HistoryScreen() {
  const [data, setData] = useState<MedicationWithStats[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const { theme, fontSize } = useTheme();

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      const medications = await getAllMedications();
      const result: MedicationWithStats[] = [];
      for (const med of medications) {
        const doses = await getDosesByMedication(med.id);
        const stats = await getAdherenceStats(med.id);
        result.push({ medication: med, doses: doses.slice(0, 20), stats });
      }
      setData(result);
      if (result.length > 0 && selectedMedId === null) {
        setSelectedMedId(result[0].medication.id);
      }
    } catch (e) {
      console.error('History load error:', e);
    }
  };

  const selectedData = data.find((d) => d.medication.id === selectedMedId);

  const getStatusColor = (status: string): string => {
    if (status === 'taken') return theme.success;
    if (status === 'missed') return theme.danger;
    return theme.textLight;
  };

  const getStatusText = (status: string): string => {
    if (status === 'taken') return 'خورده شده';
    if (status === 'missed') return 'فراموش شده';
    return 'در انتظار';
  };

  const renderDoseItem = ({ item, index }: { item: Dose; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}
      style={[styles.doseItem, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
    >
      <View style={styles.doseLeft}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <View>
          <Text style={[styles.doseTime, { color: theme.text, fontSize }]}>
            {getShortDate(item.scheduled_time)}
          </Text>
          <Text style={[styles.doseScheduled, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            ساعت {formatTime(new Date(item.scheduled_time).toTimeString().slice(0, 5))}
          </Text>
        </View>
      </View>
      <View style={styles.doseRight}>
        <Text style={[styles.doseStatus, { color: getStatusColor(item.status), fontSize }]}>
          {getStatusText(item.status)}
        </Text>
        {item.taken_at && (
          <Text style={[styles.doseTakenAt, { color: theme.textLight, fontSize: fontSize - 2 }]}>
            در {formatTime(new Date(item.taken_at).toTimeString().slice(0, 5))}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  if (data.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <Text style={[styles.headerTitle, { color: theme.text, fontSize: fontSize + 8 }]}>تاریخچه مصرف</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={[styles.emptyTitle, { color: theme.text, fontSize: fontSize + 4 }]}>
            هنوز داروی ثبت نشده
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textLight, fontSize }]}>
            بعد از ثبت مصرف، تاریخچه اینجا نشون داده میشه
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)}
        style={[styles.header, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      >
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: fontSize + 8 }]}>تاریخچه مصرف</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}
        style={[styles.medicationTabs, { backgroundColor: theme.card }]}
      >
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.medication.id)}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.medicationTab,
                { backgroundColor: theme.primaryLight },
                selectedMedId === item.medication.id && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedMedId(item.medication.id)}
            >
              <Text style={[
                styles.medicationTabText,
                { color: theme.primary, fontSize },
                selectedMedId === item.medication.id && { color: '#FFFFFF' },
              ]}>
                {item.medication.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {selectedData && (
        <>
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <DoseTracker
              total={selectedData.stats.total}
              taken={selectedData.stats.taken}
              missed={selectedData.stats.missed}
              percentage={selectedData.stats.percentage}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.dosesHeader}>
            <Text style={[styles.dosesTitle, { color: theme.text, fontSize: fontSize + 2 }]}>
              آخرین {toPersianDigits(selectedData.doses.length)} دوز
            </Text>
          </Animated.View>
          <FlatList
            data={selectedData.doses}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderDoseItem}
            contentContainerStyle={styles.dosesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.noDosesContainer}>
                <Text style={[styles.noDosesText, { color: theme.textLight, fontSize }]}>
                  هنوز دوزی ثبت نشده
                </Text>
              </View>
            }
          />
        </>
      )}
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
  headerTitle: { fontFamily: 'Vazirmatn_Bold' },
  medicationTabs: { paddingBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 8, paddingTop: 12 },
  medicationTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginLeft: 4 },
  medicationTabText: { fontFamily: 'Vazirmatn_Bold' },
  dosesHeader: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  dosesTitle: { fontFamily: 'Vazirmatn_Bold' },
  dosesList: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  doseItem: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  doseLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  doseTime: { fontFamily: 'Vazirmatn_Bold' },
  doseScheduled: { fontFamily: 'Vazirmatn', marginTop: 2 },
  doseRight: { alignItems: 'flex-end' },
  doseStatus: { fontFamily: 'Vazirmatn_Bold' },
  doseTakenAt: { fontFamily: 'Vazirmatn', marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Vazirmatn_Bold', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Vazirmatn', textAlign: 'center', lineHeight: 24 },
  noDosesContainer: { alignItems: 'center', paddingVertical: 32 },
  noDosesText: { fontFamily: 'Vazirmatn' },
});
