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
  const rows = db.getAllSync(
    'SELECT * FROM medications ORDER BY created_at DESC'
  ) as any[];

  return rows.map((row) => ({
    ...row,
    times: JSON.parse(row.times),
  }));
};

export const getMedicationById = (id: number): Medication | null => {
  const row = db.getFirstSync(
    'SELECT * FROM medications WHERE id = ?',
    [id]
  ) as any;

  if (!row) return null;

  return {
    ...row,
    times: JSON.parse(row.times),
  };
};

export const addMedication = (input: MedicationInput): number => {
  const result = db.runSync(
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
    ]
  );

  return result.lastInsertRowId;
};

export const updateMedication = (id: number, input: MedicationInput): void => {
  db.runSync(
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
};

export const deleteMedication = (id: number): void => {
  db.runSync('DELETE FROM medications WHERE id = ?', [id]);
};

export const getRemainingDays = (medication: Medication): number => {
  const totalDoses = medication.times.length;
  const pillsPerDay = totalDoses * medication.pills_per_dose;
  if (pillsPerDay === 0) return 0;

  const takenDoses = db.getFirstSync(
    `SELECT COUNT(*) as count FROM doses
     WHERE medication_id = ? AND status = 'taken'`,
    [medication.id]
  ) as any;

  const takenPills = (takenDoses?.count ?? 0) * medication.pills_per_dose;
  const remainingPills = medication.total_pills - takenPills;

  return Math.max(0, Math.floor(remainingPills / pillsPerDay));
};
