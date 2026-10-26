// SecureStore is native-only; the web build uses localStorage.
export const storage = {
  async get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage blocked (private mode); the value simply won't persist.
    }
  },
  async remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore, same as above.
    }
  },
};
