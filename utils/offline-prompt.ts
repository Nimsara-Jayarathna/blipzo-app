type OfflinePromptHandler = (reason: string) => void;

let promptHandler: OfflinePromptHandler | null = null;

export const registerOfflinePrompt = (handler: OfflinePromptHandler) => {
  promptHandler = handler;
  return () => {
    if (promptHandler === handler) {
      promptHandler = null;
    }
  };
};

export const triggerOfflinePrompt = (reason: string) => {
  if (promptHandler) {
    promptHandler(reason);
  }
};
