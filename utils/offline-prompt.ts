export type OfflinePromptPayload = {
  reason: string;
  onRetry?: () => Promise<void>;
};

type OfflinePromptHandler = (payload: OfflinePromptPayload) => void;

let promptHandler: OfflinePromptHandler | null = null;

export const registerOfflinePrompt = (handler: OfflinePromptHandler) => {
  promptHandler = handler;
  return () => {
    if (promptHandler === handler) {
      promptHandler = null;
    }
  };
};

export const triggerOfflinePrompt = (payload: OfflinePromptPayload) => {
  if (promptHandler) {
    promptHandler(payload);
  }
};
