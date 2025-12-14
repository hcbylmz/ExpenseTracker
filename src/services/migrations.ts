import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_VERSION_KEY = '@expense_tracker_db_version';
const CURRENT_VERSION = 2;

export const runMigrations = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    const savedVersion = await AsyncStorage.getItem(DB_VERSION_KEY);
    const currentVersion = savedVersion ? parseInt(savedVersion, 10) : 1;

    if (currentVersion >= CURRENT_VERSION) {
      return;
    }

    // Migration 1 -> 2: Add new columns and tables
    if (currentVersion < 2) {
      await migrateToVersion2(db);
      await AsyncStorage.setItem(DB_VERSION_KEY, '2');
    }

    // Future migrations can be added here
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

const migrateToVersion2 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Add new columns to expenses table
    await db.execAsync(`
      ALTER TABLE expenses ADD COLUMN notes TEXT;
      ALTER TABLE expenses ADD COLUMN payment_method TEXT;
      ALTER TABLE expenses ADD COLUMN account_id TEXT;
      ALTER TABLE expenses ADD COLUMN receipt_uri TEXT;
      ALTER TABLE expenses ADD COLUMN tags TEXT;
    `).catch(() => {
      // Columns might already exist, ignore error
    });

    // Create new tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS custom_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        source TEXT NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT
      );
      
      CREATE TABLE IF NOT EXISTS expense_templates (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        payment_method TEXT
      );
      
      CREATE TABLE IF NOT EXISTS expense_splits (
        id TEXT PRIMARY KEY NOT NULL,
        expense_id TEXT NOT NULL,
        person_name TEXT NOT NULL,
        amount REAL NOT NULL,
        is_paid INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
      );
    `);
  } catch (error) {
    console.error('Error in migration to version 2:', error);
    throw error;
  }
};
