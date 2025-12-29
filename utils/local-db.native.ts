import dayjs from 'dayjs';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

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

let db: SQLiteDatabase | null = null;

const getDb = () => {
  if (!db) {
    db = openDatabaseSync('blipzo.db');
  }
  return db;
};

type BindValue = string | number | null;

const normalizeParams = (params: unknown[]): BindValue[] =>
  params.map((value) => {
    if (value === undefined) return null;
    if (value === null) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value as BindValue;
  });

const run = async (sql: string, params: unknown[] = []) => {
  const normalized = normalizeParams(params);
  if (!normalized.length) return getDb().runAsync(sql);
  return getDb().runAsync(sql, normalized);
};

const getAll = async <T,>(sql: string, params: unknown[] = []) => {
  const normalized = normalizeParams(params);
  if (!normalized.length) return getDb().getAllAsync<T>(sql);
  return getDb().getAllAsync<T>(sql, normalized);
};

const getFirst = async <T,>(sql: string, params: unknown[] = []) => {
  const normalized = normalizeParams(params);
  if (!normalized.length) return getDb().getFirstAsync<T>(sql);
  return getDb().getFirstAsync<T>(sql, normalized);
};

export const initDb = async () => {
  await run(
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

  await run(
    `CREATE TABLE IF NOT EXISTS categories (
      localId TEXT PRIMARY KEY NOT NULL,
      serverId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      isDefault INTEGER NOT NULL,
      updatedAt TEXT NOT NULL
    );`
  );

  await run(
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

  await run(
    `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`
  );
};

export const insertPendingTransaction = async (row: LocalTransactionRow) => {
  await run(
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
  return getAll<LocalTransactionRow>(
    `SELECT * FROM transactions WHERE status = 'pending' ORDER BY createdAt ASC`
  );
};

const normalizeLocalDate = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value;
};

export const getLocalTransactionsByDate = async (date: string) => {
  const base = dayjs(date);
  const prev = base.subtract(1, 'day').format('YYYY-MM-DD');
  const next = base.add(1, 'day').format('YYYY-MM-DD');
  const rows = await getAll<LocalTransactionRow>(
    `SELECT * FROM transactions WHERE date LIKE ? OR date LIKE ? OR date LIKE ? ORDER BY createdAt DESC`,
    [`${prev}%`, `${date}%`, `${next}%`]
  );
  return rows.filter(row => normalizeLocalDate(row.date) === date);
};

export const deleteTransactionByLocalId = async (localId: string) => {
  await run(`DELETE FROM transactions WHERE localId = ?`, [localId]);
};

export const replaceSyncedTransactions = async (transactions: Transaction[]) => {
  await run(`DELETE FROM transactions WHERE status = 'synced'`);

  for (const item of transactions) {
    const serverId = item._id ?? item.id ?? '';
    const normalizedDate = normalizeLocalDate(item.date);
    await run(
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
        normalizedDate,
        item.createdAt,
        item.updatedAt,
      ]
    );
  }
};

export const replaceCategories = async (categories: Category[]) => {
  await run(`DELETE FROM categories`);

  for (const category of categories) {
    const serverId = category._id ?? category.id ?? '';
    await run(
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
  return getAll<{
    serverId: string;
    name: string;
    type: 'income' | 'expense';
    isDefault: number;
  }>(`SELECT * FROM categories`);
};

export const upsertProfile = async (profile: LocalProfileRow) => {
  await run(
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
  return getAll<Record<string, unknown>>(`SELECT * FROM ${table} LIMIT 200`);
};

export const setMetaValue = async (key: string, value: string) => {
  await run(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`, [key, value]);
};

export const getMetaValue = async (key: string) => {
  const result = await getFirst<{ value: string }>(
    `SELECT value FROM meta WHERE key = ? LIMIT 1`,
    [key]
  );
  return result?.value;
};

export const getCounts = async () => {
  const tx = await getFirst<{ count: number }>(`SELECT COUNT(*) as count FROM transactions`);
  const cat = await getFirst<{ count: number }>(`SELECT COUNT(*) as count FROM categories`);
  const prof = await getFirst<{ count: number }>(`SELECT COUNT(*) as count FROM profile`);
  return {
    transactions: tx?.count ?? 0,
    categories: cat?.count ?? 0,
    profile: prof?.count ?? 0,
  };
};
