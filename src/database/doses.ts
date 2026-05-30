import { db } from './schema';

export interface Dose {
  id: number;
  medication_id: number;
  scheduled_time: string;
  taken_at: string | null;
  status: 'pending' | 'taken' | 'missed';
}

export const getDosesByMedication = (medicationId: number): Promise<Dose[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM doses WHERE medication_id = ? ORDER BY scheduled_time DESC',
        [medicationId],
        (_, result) => {
          const doses: Dose[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            doses.push(result.rows.item(i));
          }
          resolve(doses);
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const addDose = (medicationId: number, scheduledTime: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO doses (medication_id, scheduled_time, status) VALUES (?, ?, 'pending')`,
        [medicationId, scheduledTime],
        (_, result) => { resolve(result.insertId ?? -1); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const markDoseTaken = (doseId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE doses SET status = 'taken', taken_at = ? WHERE id = ?`,
        [now, doseId],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getAdherenceStats = (medicationId: number): Promise<{ total: number; taken: number; missed: number; percentage: number }> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
           SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
         FROM doses WHERE medication_id = ?`,
        [medicationId],
        (_, result) => {
          const row = result.rows.item(0);
          const total = row.total ?? 0;
          const taken = row.taken ?? 0;
          const missed = row.missed ?? 0;
          const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
          resolve({ total, taken, missed, percentage });
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getDoseByScheduledTime = (medicationId: number, scheduledTime: string): Promise<Dose | null> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM doses WHERE medication_id = ? AND scheduled_time = ?',
        [medicationId, scheduledTime],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};
