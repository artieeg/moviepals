//TODO: replace with redis
const cache = new Map();

export function cachify(fn: Function) {
  return async function (...args: unknown[]) {
    console.log(args);
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log("cache hit");
      return cache.get(key);
    }

    console.log("running");

    const result = await fn(...args);

    cache.set(key, result);

    return result;
  };
}
