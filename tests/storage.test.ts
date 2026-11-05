import { expect, test } from 'bun:test';
import type { KeyValueStore } from '../src/platform/types';
import type { Convert } from '../src/services';
import { CACHE_KEY, createCachedConverter } from '../src/services/conversion-cache';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  saveSettings,
} from '../src/services/settings';

function store(): KeyValueStore {
  const values = new Map<string, unknown>();
  return {
    async get(key) {
      return structuredClone(values.get(key));
    },
    async set(key, value) {
      values.set(key, structuredClone(value));
    },
    async remove(key) {
      values.delete(key);
    },
  };
}
test('settings persist each script and disabled state; malformed data falls back safely', async () => {
  const memory = store();
  expect(await loadSettings(memory)).toEqual(DEFAULT_SETTINGS);
  for (const japaneseScript of ['romaji', 'hiragana', 'katakana'] as const) {
    const value = { enabled: false, japaneseScript, language: 'Japanese' as const };
    await saveSettings(memory, value);
    expect(await loadSettings(memory)).toEqual(value);
  }
  await memory.set(SETTINGS_KEY, {
    enabled: 'yes',
    japaneseScript: 'invalid',
    language: 'invalid',
  });
  expect(await loadSettings(memory)).toEqual(DEFAULT_SETTINGS);
});

test('cache distinguishes content, scripts and language; corrupt data and storage failures degrade gracefully', async () => {
  const memory = store();
  await memory.set(CACHE_KEY, [{ key: 1 }, null]);
  let calls = 0;
  const convert: Convert = async texts => {
    calls++;
    return texts.map(text => text.toUpperCase());
  };
  const cached = createCachedConverter(convert, memory, 'test');
  expect(await cached(['a'], DEFAULT_SETTINGS)).toEqual(['A']);
  expect(await cached(['a'], DEFAULT_SETTINGS)).toEqual(['A']);
  await cached(['b'], DEFAULT_SETTINGS);
  await cached(['a'], { japaneseScript: 'katakana' });
  await cached(['a'], { ...DEFAULT_SETTINGS, language: 'Japanese' });
  expect(calls).toBe(4);
  const broken: KeyValueStore = {
    async get() {
      throw Error('blocked');
    },
    async set() {
      throw Error('quota');
    },
    async remove() {},
  };
  expect(await createCachedConverter(convert, broken, 'test')(['a'], DEFAULT_SETTINGS)).toEqual([
    'A',
  ]);
  expect(await loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
});

test('cache bounds entry count and byte size and can be reopened', async () => {
  const memory = store();
  const convert: Convert = async texts => [...texts];
  const cached = createCachedConverter(convert, memory, 'test');
  for (let i = 0; i < 102; i++) await cached([String(i)], DEFAULT_SETTINGS);
  expect(((await memory.get(CACHE_KEY)) as unknown[]).length).toBe(100);
  expect(
    await createCachedConverter(
      async () => {
        throw Error('cache miss');
      },
      memory,
      'test',
    )(['101'], DEFAULT_SETTINGS),
  ).toEqual(['101']);
  await cached(['x'.repeat(3 * 1024 * 1024)], DEFAULT_SETTINGS);
  expect(
    new TextEncoder().encode(JSON.stringify(await memory.get(CACHE_KEY))).byteLength,
  ).toBeLessThanOrEqual(5 * 1024 * 1024);
});
