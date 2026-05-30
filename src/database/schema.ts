import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ghors.db');

export const initDatabase = (): void => {
  db.transaction((tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dose TEXT NOT NULL,
        total_pills INTEGER NOT NULL,
        pills_per_dose INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        times TEXT NOT NULL,
        audio_uri TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS doses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER NOT NULL,
        scheduled_time TEXT NOT NULL,
        taken_at TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (medication_id) REFERENCES medications (id) ON DELETE CASCADE
      );
    `);
  });
};

export { db };
