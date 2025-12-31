export const isNetworkOrTimeoutError = (error: unknown) => {
  const err = error as { response?: unknown; code?: string; message?: string };
  if (!err) return false;
  if (!err.response) return true;
  if (err.code === 'ECONNABORTED') return true;
  if (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout')) {
    return true;
  }
  return false;
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0 || !isNetworkOrTimeoutError(error)) {
      throw error;
    }
    return withRetry(fn, retries - 1);
  }
};

export const isAuthError = (error: unknown) => {
  const err = error as { response?: { status?: number } };
  const status = err?.response?.status;
  return status === 401 || status === 419;
};
