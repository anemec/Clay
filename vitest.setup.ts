const createStorage = () => {
  let store = {} as Record<string, string>;
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    configurable: true
  });
}
