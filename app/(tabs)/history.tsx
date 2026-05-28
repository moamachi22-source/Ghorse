import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllMedications, Medication } from '@/database/medications';
import { getDosesByMedication, Dose } from '@/database/doses';
import { getAdherenceStats } from '@/database/doses';
import { DoseTracker } from '@/components/DoseTracker';
import { toPersianDigits, formatTime, getShortDate } from '@/utils/persian';

interface MedicationWithStats {
  medication: Medication;
  doses: Dose[];
  stats: {
    total: number;
    taken: number;
    missed: number;
    percentage: number;
  };
}

export default function HistoryScreen() {
  const [data, setData] = useState<MedicationWithStats[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    const medications = getAllMedications();
    const result: MedicationWithStats[] = medications.map((med) => ({
      medication: med,
      doses: getDosesByMedication(med.id).slice(0, 20),
      stats: getAdherenceStats(med.id),
    }));
    setData(result);
    if (result.length > 0 && selectedMedId === null) {
      setSelectedMedId(result[0].medication.id);
    }
  };

  const selectedData = data.find(
    (d) => d.medication.id === selectedMedId
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'taken': return '#4CAF50';
      case 'missed': return '#FF6B6B';
      default: return '#9E9EA7';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'taken': return '✅ خورده شده';
      case 'missed': return '❌ فراموش شده';
      default: return '⏳ در انتظار';
    }
  };

  const renderDoseItem = ({ item, index }: { item: Dose; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.doseItem}
    >
      <View style={styles.doseLeft}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <View>
          <Text style={styles.doseTime}>
            {getShortDate(item.scheduled_time)}
          </Text>
          <Text style={styles.doseScheduled}>
            ساعت {formatTime(
              new Date(item.scheduled_time)
                .toTimeString()
                .slice(0, 5)
            )}
          </Text>
        </View>
      </View>
      <View style={styles.doseRight}>
        <Text
          style={[
            styles.doseStatus,
            { color: getStatusColor(item.status) },
          ]}
        >
          {getStatusText(item.status)}
        </Text>
        {item.taken_at && (
          <Text style={styles.doseTakenAt}>
            خورده شده در{' '}
            {formatTime(
              new Date(item.taken_at).toTimeString().slice(0, 5)
            )}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تاریخچه مصرف</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>هنوز داروی ثبت نشده</Text>
          <Text style={styles.emptySubtitle}>
            بعد از اضافه کردن دارو و ثبت مصرف، تاریخچه اینجا نشون داده میشه
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>تاریخچه مصرف</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.medicationTabs}
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
                selectedMedId === item.medication.id &&
                  styles.medicationTabActive,
              ]}
              onPress={() => setSelectedMedId(item.medication.id)}
            >
              <Text
                style={[
                  styles.medicationTabText,
                  selectedMedId === item.medication.id &&
                    styles.medicationTabTextActive,
                ]}
              >
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

          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.dosesHeader}
          >
            <Text style={styles.dosesTitle}>
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
                <Text style={styles.noDosesText}>
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
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  medicationTabs: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingTop: 12,
  },
  medicationTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0EFFF',
    marginLeft: 4,
  },
  medicationTabActive: {
    backgroundColor: '#6C63FF',
  },
  medicationTabText: {
    fontSize: 14,
    fontFamily: 'Vazirmatn',
    color: '#6C63FF',
  },
  medicationTabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Vazirmatn_Bold',
  },
  dosesHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  dosesTitle: {
    fontSize: 16,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  dosesList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  doseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  doseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  doseTime: {
    fontSize: 15,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
  },
  doseScheduled: {
    fontSize: 12,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    marginTop: 2,
  },
  doseRight: {
    alignItems: 'flex-end',
  },
  doseStatus: {
    fontSize: 13,
    fontFamily: 'Vazirmatn_Bold',
  },
  doseTakenAt: {
    fontSize: 11,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Vazirmatn_Bold',
    color: '#2D2D3A',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
    textAlign: 'center',
    lineHeight: 24,
  },
  noDosesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDosesText: {
    fontSize: 15,
    fontFamily: 'Vazirmatn',
    color: '#9E9EA7',
  },
});
