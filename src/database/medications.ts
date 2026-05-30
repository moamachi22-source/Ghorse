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

export const getAllMedications = (): Medication[] => {
  let medications: Medication[] = [];
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM medications ORDER BY created_at DESC',
      [],
      (_, result) => {
        const rows = result.rows;
        for (let i = 0; i < rows.length; i++) {
          const row = rows.item(i);
          medications.push({ ...row, times: JSON.parse(row.times) });
        }
      }
    );
  });
  return medications;
};

export const getMedicationById = (id: number): Medication | null => {
  let medication: Medication | null = null;
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM medications WHERE id = ?',
      [id],
      (_, result) => {
        if (result.rows.length > 0) {
          const row = result.rows.item(0);
          medication = { ...row, times: JSON.parse(row.times) };
        }
      }
    );
  });
  return medication;
};

export const addMedication = (input: MedicationInput): number => {
  let newId = -1;
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
      (_, result) => {
        newId = result.insertId ?? -1;
      }
    );
  });
  return newId;
};

export const updateMedication = (id: number, input: MedicationInput): void => {
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
      ]
    );
  });
};

export const deleteMedication = (id: number): void => {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM medications WHERE id = ?', [id]);
  });
};

export const getRemainingDays = (medication: Medication): number => {
  let takenCount = 0;
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT COUNT(*) as count FROM doses WHERE medication_id = ? AND status = 'taken'`,
      [medication.id],
      (_, result) => {
        takenCount = result.rows.item(0).count ?? 0;
      }
    );
  });
  const pillsPerDay = medication.times.length * medication.pills_per_dose;
  if (pillsPerDay === 0) return 0;
  const takenPills = takenCount * medication.pills_per_dose;
  const remainingPills = medication.total_pills - takenPills;
  return Math.max(0, Math.floor(remainingPills / pillsPerDay));
};
