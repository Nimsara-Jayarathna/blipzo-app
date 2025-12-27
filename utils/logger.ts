type LogPayload = Record<string, unknown> | undefined;

export const logDebug = (message: string, data?: LogPayload) => {
  if (data !== undefined) {
    console.log(`[debug] ${message}`, data);
    return;
  }

  console.log(`[debug] ${message}`);
};

export const logError = (message: string, error?: unknown) => {
  if (error !== undefined) {
    console.error(`[error] ${message}`, error);
    return;
  }

  console.error(`[error] ${message}`);
};
