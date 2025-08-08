// src/utils/toast.js
const subscribers = new Set();

/** Fire a toast */
export function toast(message, opts = {}) {
  const id = Date.now() + Math.random();
  const payload = { id, message, duration: opts.duration ?? 1800 };
  subscribers.forEach(cb => cb(payload));
  return id;
}

/** Internal: subscribe a listener (used by the host component) */
export function subscribeToast(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
