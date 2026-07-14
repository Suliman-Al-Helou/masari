
export const logger = {
  error: (err: unknown, context?: string) => {
    console.error(context ? `[ERROR] ${context}` : '[ERROR]', err);
  },
};