export const logger = {
  info: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.info(message, meta);
      return;
    }

    console.info(message);
  },
  warn: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.warn(message, meta);
      return;
    }

    console.warn(message);
  },
  error: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.error(message, meta);
      return;
    }

    console.error(message);
  },
};
