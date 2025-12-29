import * as SQLite from 'expo-sqlite';

import type { Category, Transaction } from '@/types';

export type LocalTransactionStatus = 'pending' | 'synced';

export type LocalTransactionRow = {
  localId: string;
  serverId?: string | null;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  categoryName?: string | null;
  note?: string | null;
  date: string;
  status: LocalTransactionStatus;
  createdAt: string;
  updatedAt: string;
};

export type LocalProfileRow = {
  id: string;
  name: string;
  fname?: string | null;
  lname?: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  categoryLimit?: number | null;
  defaultIncomeCategories?: string[];
  defaultExpenseCategories?: string[];
};

const db = SQLite.openDatabase('blipzo.db');

const executeSql = (sql: string, params: (string | number | null)[] = []) =>
  new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });

export const initDb = async () => {
  await executeSql(
    `CREATE TABLE IF NOT EXISTS transactions (
      localId TEXT PRIMARY KEY NOT NULL,
      serverId TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      categoryId TEXT NOT NULL,
      categoryName TEXT,
      note TEXT,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`
  );

  await executeSql(
    `CREATE TABLE IF NOT EXISTS categories (
      localId TEXT PRIMARY KEY NOT NULL,
      serverId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      isDefault INTEGER NOT NULL,
      updatedAt TEXT NOT NULL
    );`
  );

  await executeSql(
    `CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      fname TEXT,
      lname TEXT,
      email TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      categoryLimit INTEGER,
      defaultIncomeCategories TEXT,
      defaultExpenseCategories TEXT
    );`
  );

  await executeSql(
    `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`
  );
};

export const insertPendingTransaction = async (row: LocalTransactionRow) => {
  await executeSql(
    `INSERT INTO transactions (
      localId, serverId, type, amount, categoryId, categoryName, note, date, status, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.localId,
      row.serverId ?? null,
      row.type,
      row.amount,
      row.categoryId,
      row.categoryName ?? null,
      row.note ?? null,
      row.date,
      row.status,
      row.createdAt,
      row.updatedAt,
    ]
  );
};

export const getPendingTransactions = async () => {
  const result = await executeSql(
    `SELECT * FROM transactions WHERE status = 'pending' ORDER BY createdAt ASC`
  );
  return result.rows._array as LocalTransactionRow[];
};

export const deleteTransactionByLocalId = async (localId: string) => {
  await executeSql(`DELETE FROM transactions WHERE localId = ?`, [localId]);
};

export const replaceSyncedTransactions = async (transactions: Transaction[]) => {
  await executeSql(`DELETE FROM transactions WHERE status = 'synced'`);

  for (const item of transactions) {
    const serverId = item._id ?? item.id ?? '';
    await executeSql(
      `INSERT INTO transactions (
        localId, serverId, type, amount, categoryId, categoryName, note, date, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)`,
      [
        serverId,
        serverId,
        item.type,
        item.amount,
        item.categoryId ?? (typeof item.category === 'string' ? item.category : '') ?? '',
        item.categoryName ?? (typeof item.category === 'string' ? item.category : null),
        item.note ?? null,
        item.date,
        item.createdAt,
        item.updatedAt,
      ]
    );
  }
};

export const replaceCategories = async (categories: Category[]) => {
  await executeSql(`DELETE FROM categories`);

  for (const category of categories) {
    const serverId = category._id ?? category.id ?? '';
    await executeSql(
      `INSERT INTO categories (
        localId, serverId, name, type, isDefault, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        serverId,
        serverId,
        category.name,
        category.type,
        category.isDefault ? 1 : 0,
        category.updatedAt,
      ]
    );
  }
};

export const getLocalCategories = async () => {
  const result = await executeSql(`SELECT * FROM categories`);
  return result.rows._array as Array<{
    serverId: string;
    name: string;
    type: 'income' | 'expense';
    isDefault: number;
  }>;
};

export const upsertProfile = async (profile: LocalProfileRow) => {
  await executeSql(
    `INSERT OR REPLACE INTO profile (
      id, name, fname, lname, email, createdAt, updatedAt, categoryLimit, defaultIncomeCategories, defaultExpenseCategories
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.name,
      profile.fname ?? null,
      profile.lname ?? null,
      profile.email,
      profile.createdAt,
      profile.updatedAt,
      profile.categoryLimit ?? null,
      profile.defaultIncomeCategories
        ? JSON.stringify(profile.defaultIncomeCategories)
        : null,
      profile.defaultExpenseCategories
        ? JSON.stringify(profile.defaultExpenseCategories)
        : null,
    ]
  );
};

export const getAllRows = async (table: 'transactions' | 'categories' | 'profile') => {
  const result = await executeSql(`SELECT * FROM ${table} LIMIT 200`);
  return result.rows._array;
};

export const setMetaValue = async (key: string, value: string) => {
  await executeSql(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`, [key, value]);
};

export const getMetaValue = async (key: string) => {
  const result = await executeSql(`SELECT value FROM meta WHERE key = ? LIMIT 1`, [key]);
  return result.rows._array[0]?.value as string | undefined;
};

export const getCounts = async () => {
  const tx = await executeSql(`SELECT COUNT(*) as count FROM transactions`);
  const cat = await executeSql(`SELECT COUNT(*) as count FROM categories`);
  const prof = await executeSql(`SELECT COUNT(*) as count FROM profile`);
  return {
    transactions: tx.rows._array[0]?.count ?? 0,
    categories: cat.rows._array[0]?.count ?? 0,
    profile: prof.rows._array[0]?.count ?? 0,
  };
};
