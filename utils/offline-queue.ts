import AsyncStorage from '@react-native-async-storage/async-storage';

export type OfflineTransaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
  note?: string;
  isServerRecord: false;
  createdAt: string;
};

const OFFLINE_QUEUE_KEY = 'offline_transactions_queue';

export const enqueueOfflineTransaction = async (transaction: OfflineTransaction) => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue: OfflineTransaction[] = raw ? JSON.parse(raw) : [];
  queue.push(transaction);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueue = async () => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as OfflineTransaction[]) : [];
};
