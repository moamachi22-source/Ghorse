import { db } from './schema';

export interface Dose {
  id: number;
  medication_id: number;
  scheduled_time: string;
  taken_at: string | null;
  status: 'pending' | 'taken' | 'missed';
}

export interface DoseWithMedication extends Dose {
  medication_name: string;
  medication_dose: string;
  pills_per_dose: number;
}

export const getTodayDoses = (): DoseWithMedication[] => {
  const today = new Date().toISOString().split('T')[0];

  const rows = db.getAllSync(
    `SELECT d.*, m.name as medication_name, m.dose as medication_dose, m.pills_per_dose
     FROM doses d
     JOIN medications m ON d.medication_id = m.id
     WHERE d.scheduled_time LIKE ?
     ORDER BY d.scheduled_time ASC`,
    [`${today}%`]
  ) as any[];

  return rows;
};

export const getDosesByMedication = (medicationId: number): Dose[] => {
  const rows = db.getAllSync(
    'SELECT * FROM doses WHERE medication_id = ? ORDER BY scheduled_time DESC',
    [medicationId]
  ) as any[];

  return rows;
};

export const addDose = (
  medicationId: number,
  scheduledTime: string
): number => {
  const result = db.runSync(
    `INSERT INTO doses (medication_id, scheduled_time, status)
     VALUES (?, ?, 'pending')`,
    [medicationId, scheduledTime]
  );

  return result.lastInsertRowId;
};

export const markDoseTaken = (doseId: number): void => {
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE doses SET status = 'taken', taken_at = ? WHERE id = ?`,
    [now, doseId]
  );
};

export const markDoseMissed = (doseId: number): void => {
  db.runSync(
    `UPDATE doses SET status = 'missed' WHERE id = ?`,
    [doseId]
  );
};

export const getAdherenceStats = (medicationId: number) => {
  const stats = db.getFirstSync(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
       SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
     FROM doses
     WHERE medication_id = ?`,
    [medicationId]
  ) as any;

  const total = stats?.total ?? 0;
  const taken = stats?.taken ?? 0;
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  return {
    total,
    taken,
    missed: stats?.missed ?? 0,
    percentage,
  };
};

export const getDoseByScheduledTime = (
  medicationId: number,
  scheduledTime: string
): Dose | null => {
  const row = db.getFirstSync(
    'SELECT * FROM doses WHERE medication_id = ? AND scheduled_time = ?',
    [medicationId, scheduledTime]
  ) as any;

  return row ?? null;
};
