import { create } from 'zustand';
import {
  Medication,
  MedicationInput,
  getAllMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getRemainingDays,
} from '../database/medications';
import { getAdherenceStats } from '../database/doses';

interface MedicationStore {
  medications: Medication[];
  isLoading: boolean;
  error: string | null;
  takenDosesMap: Record<number, number>;
  loadMedications: () => Promise<void>;
  addMedication: (input: MedicationInput) => Promise<number>;
  updateMedication: (id: number, input: MedicationInput) => Promise<void>;
  deleteMedication: (id: number) => Promise<void>;
  getRemainingDays: (medication: Medication) => number;
  loadTakenDoses: (medications: Medication[]) => Promise<void>;
}

export const useMedicationStore = create<MedicationStore>((set, get) => ({
  medications: [],
  isLoading: false,
  error: null,
  takenDosesMap: {},

  loadMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const medications = await getAllMedications();
      set({ medications, isLoading: false });
      await get().loadTakenDoses(medications);
    } catch (error) {
      set({ error: 'خطا در بارگذاری داروها', isLoading: false });
    }
  },

  loadTakenDoses: async (medications: Medication[]) => {
    const map: Record<number, number> = {};
    for (const med of medications) {
      try {
        const stats = await getAdherenceStats(med.id);
        map[med.id] = stats.taken;
      } catch (e) {
        map[med.id] = 0;
      }
    }
    set({ takenDosesMap: map });
  },

  addMedication: async (input: MedicationInput) => {
    try {
      const id = await addMedication(input);
      const medications = await getAllMedications();
      set({ medications });
      await get().loadTakenDoses(medications);
      return id;
    } catch (error) {
      set({ error: 'خطا در افزودن دارو' });
      return -1;
    }
  },

  updateMedication: async (id: number, input: MedicationInput) => {
    try {
      await updateMedication(id, input);
      const medications = await getAllMedications();
      set({ medications });
      await get().loadTakenDoses(medications);
    } catch (error) {
      set({ error: 'خطا در ویرایش دارو' });
    }
  },

  deleteMedication: async (id: number) => {
    try {
      await deleteMedication(id);
      const medications = await getAllMedications();
      set({ medications });
      await get().loadTakenDoses(medications);
    } catch (error) {
      set({ error: 'خطا در حذف دارو' });
    }
  },

  getRemainingDays: (medication: Medication) => {
    const takenCount = get().takenDosesMap[medication.id] ?? 0;
    return getRemainingDays(medication, takenCount);
  },
}));
