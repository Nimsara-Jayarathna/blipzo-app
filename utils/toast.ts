export type ToastPayload = {
  message: string;
};

type ToastHandler = (payload: ToastPayload) => void;

let toastHandler: ToastHandler | null = null;

export const registerToast = (handler: ToastHandler) => {
  toastHandler = handler;
  return () => {
    if (toastHandler === handler) {
      toastHandler = null;
    }
  };
};

export const triggerToast = (payload: ToastPayload) => {
  if (toastHandler) {
    toastHandler(payload);
  }
};
