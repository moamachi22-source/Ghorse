import { create } from 'zustand';
import {
  Medication,
  MedicationInput,
  getAllMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getRemainingDays,
} from '@/database/medications';

interface MedicationStore {
  medications: Medication[];
  isLoading: boolean;
  error: string | null;
  loadMedications: () => void;
  addMedication: (input: MedicationInput) => number;
  updateMedication: (id: number, input: MedicationInput) => void;
  deleteMedication: (id: number) => void;
  getRemainingDays: (medication: Medication) => number;
}

export const useMedicationStore = create<MedicationStore>((set) => ({
  medications: [],
  isLoading: false,
  error: null,

  loadMedications: () => {
    set({ isLoading: true, error: null });
    try {
      const medications = getAllMedications();
      set({ medications, isLoading: false });
    } catch (error) {
      set({ error: 'خطا در بارگذاری داروها', isLoading: false });
    }
  },

  addMedication: (input: MedicationInput) => {
    try {
      const id = addMedication(input);
      const medications = getAllMedications();
      set({ medications });
      return id;
    } catch (error) {
      set({ error: 'خطا در افزودن دارو' });
      return -1;
    }
  },

  updateMedication: (id: number, input: MedicationInput) => {
    try {
      updateMedication(id, input);
      const medications = getAllMedications();
      set({ medications });
    } catch (error) {
      set({ error: 'خطا در ویرایش دارو' });
    }
  },

  deleteMedication: (id: number) => {
    try {
      deleteMedication(id);
      const medications = getAllMedications();
      set({ medications });
    } catch (error) {
      set({ error: 'خطا در حذف دارو' });
    }
  },

  getRemainingDays: (medication: Medication) => {
    return getRemainingDays(medication);
  },
}));
