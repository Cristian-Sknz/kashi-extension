import type { Convert } from '.';
import type { KeyValueStore } from '../platform/types';

export const CACHE_KEY = 'kashi:cache:v1';

const MAX_ENTRIES = 100;
const MAX_BYTES = 5 * 1024 * 1024;
const encoder = new TextEncoder();

type Entry = { key: string; values: string[] };

function isEntry(value: unknown): value is Entry {
  if (typeof value !== 'object' || value === null) return false;

  const { key, values } = value as Partial<Entry>;
  return (
    typeof key === 'string' &&
    Array.isArray(values) &&
    values.every(value => typeof value === 'string')
  );
}

function trimCache(entries: Entry[]) {
  // ponytail: this linear LRU is bounded to 100 entries; use IndexedDB if the limit grows.
  while (
    entries.length > MAX_ENTRIES ||
    encoder.encode(JSON.stringify(entries)).length > MAX_BYTES
  ) {
    entries.shift();
  }
  return entries;
}

export function createCachedConverter(
  convert: Convert,
  store: KeyValueStore,
  version: string,
): Convert {
  let ready: Promise<Entry[]> | undefined;
  let writes = Promise.resolve();

  return async (texts, options) => {
    ready ??= store
      .get(CACHE_KEY)
      .then(value => (Array.isArray(value) ? trimCache(value.filter(isEntry)) : []))
      .catch(() => []);
    const entries = await ready;
    const key = JSON.stringify([version, options.japaneseScript, options.language ?? null, texts]);

    const index = entries.findIndex(entry => entry.key === key);
    const hit = entries[index];
    if (hit?.values.length === texts.length) {
      entries.splice(index, 1);
      entries.push(hit);
      return [...hit.values];
    }

    const values = await convert(texts, options);
    if (values.length !== texts.length || values.some(value => typeof value !== 'string')) {
      throw new Error('Invalid conversion result.');
    }

    // Another conversion may have populated this key while we were waiting.
    const duplicate = entries.findIndex(entry => entry.key === key);
    if (duplicate >= 0) entries.splice(duplicate, 1);
    entries.push({ key, values: [...values] });

    const snapshot = [...trimCache(entries)];
    writes = writes.then(() => store.set(CACHE_KEY, snapshot)).catch(() => {});
    await writes;
    return values;
  };
}
