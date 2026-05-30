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
  let doses: DoseWithMedication[] = [];
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT d.*, m.name as medication_name, m.dose as medication_dose, m.pills_per_dose
       FROM doses d
       JOIN medications m ON d.medication_id = m.id
       WHERE d.scheduled_time LIKE ?
       ORDER BY d.scheduled_time ASC`,
      [today + '%'],
      (_, result) => {
        for (let i = 0; i < result.rows.length; i++) {
          doses.push(result.rows.item(i));
        }
      }
    );
  });
  return doses;
};

export const getDosesByMedication = (medicationId: number): Dose[] => {
  let doses: Dose[] = [];
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM doses WHERE medication_id = ? ORDER BY scheduled_time DESC',
      [medicationId],
      (_, result) => {
        for (let i = 0; i < result.rows.length; i++) {
          doses.push(result.rows.item(i));
        }
      }
    );
  });
  return doses;
};

export const addDose = (medicationId: number, scheduledTime: string): number => {
  let newId = -1;
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO doses (medication_id, scheduled_time, status) VALUES (?, ?, 'pending')`,
      [medicationId, scheduledTime],
      (_, result) => {
        newId = result.insertId ?? -1;
      }
    );
  });
  return newId;
};

export const markDoseTaken = (doseId: number): void => {
  const now = new Date().toISOString();
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE doses SET status = 'taken', taken_at = ? WHERE id = ?`,
      [now, doseId]
    );
  });
};

export const markDoseMissed = (doseId: number): void => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE doses SET status = 'missed' WHERE id = ?`,
      [doseId]
    );
  });
};

export const getAdherenceStats = (medicationId: number) => {
  let total = 0;
  let taken = 0;
  let missed = 0;
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
         SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
       FROM doses
       WHERE medication_id = ?`,
      [medicationId],
      (_, result) => {
        const row = result.rows.item(0);
        total = row.total ?? 0;
        taken = row.taken ?? 0;
        missed = row.missed ?? 0;
      }
    );
  });
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
  return { total, taken, missed, percentage };
};

export const getDoseByScheduledTime = (medicationId: number, scheduledTime: string): Dose | null => {
  let dose: Dose | null = null;
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM doses WHERE medication_id = ? AND scheduled_time = ?',
      [medicationId, scheduledTime],
      (_, result) => {
        if (result.rows.length > 0) {
          dose = result.rows.item(0);
        }
      }
    );
  });
  return dose;
};
