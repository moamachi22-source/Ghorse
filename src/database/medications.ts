import { db } from './schema';

export interface Medication {
  id: number;
  name: string;
  dose: string;
  total_pills: number;
  pills_per_dose: number;
  start_date: string;
  times: string[];
  audio_uri?: string;
  created_at: string;
}

export interface MedicationInput {
  name: string;
  dose: string;
  total_pills: number;
  pills_per_dose: number;
  start_date: string;
  times: string[];
  audio_uri?: string;
}

export const getAllMedications = (): Promise<Medication[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM medications ORDER BY created_at DESC',
        [],
        (_, result) => {
          const medications: Medication[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            medications.push({ ...row, times: JSON.parse(row.times) });
          }
          resolve(medications);
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getMedicationById = (id: number): Promise<Medication | null> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM medications WHERE id = ?',
        [id],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({ ...row, times: JSON.parse(row.times) });
          } else {
            resolve(null);
          }
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const addMedication = (input: MedicationInput): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO medications (name, dose, total_pills, pills_per_dose, start_date, times, audio_uri)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          input.name,
          input.dose,
          input.total_pills,
          input.pills_per_dose,
          input.start_date,
          JSON.stringify(input.times),
          input.audio_uri ?? null,
        ],
        (_, result) => { resolve(result.insertId ?? -1); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const updateMedication = (id: number, input: MedicationInput): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE medications
         SET name = ?, dose = ?, total_pills = ?, pills_per_dose = ?, start_date = ?, times = ?, audio_uri = ?
         WHERE id = ?`,
        [
          input.name,
          input.dose,
          input.total_pills,
          input.pills_per_dose,
          input.start_date,
          JSON.stringify(input.times),
          input.audio_uri ?? null,
          id,
        ],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const deleteMedication = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM medications WHERE id = ?',
        [id],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getRemainingDays = (medication: Medication, takenCount: number): number => {
  const pillsPerDay = medication.times.length * medication.pills_per_dose;
  if (pillsPerDay === 0) return 0;
  const takenPills = takenCount * medication.pills_per_dose;
  const remainingPills = medication.total_pills - takenPills;
  return Math.max(0, Math.floor(remainingPills / pillsPerDay));
};
