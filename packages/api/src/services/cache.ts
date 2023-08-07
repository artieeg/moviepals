//TODO: replace with redis
const cache = new Map();

export function cachify<T extends (...args: any[]) => any>(fn: T) {
  return async function (...args: Parameters<T>) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await fn(...args);

    cache.set(key, result);

    return result;
  };
}
