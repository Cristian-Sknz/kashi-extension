import type { KeyValueStore } from './types';

export type SpicetifyApi = {
  Player: {
    addEventListener(event: 'songchange', listener: () => void): void;
    removeEventListener(event: 'songchange', listener: () => void): void;
  };
};
declare global {
  interface Window {
    Spicetify?: SpicetifyApi;
  }
}

export async function waitForSpicetify(
  get = () => window.Spicetify,
  timeoutMs = 15000,
): Promise<SpicetifyApi> {
  const end = Date.now() + timeoutMs;
  do {
    const api = get();
    if (
      typeof api?.Player?.addEventListener === 'function' &&
      typeof api.Player.removeEventListener === 'function'
    )
      return api;
    if (Date.now() >= end) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  } while (Date.now() <= end);
  throw new Error('Spicetify.Player is unavailable. Apply Spicetify and restart Spotify.');
}

export function desktopStore(storage: Storage): KeyValueStore {
  return {
    async get(key) {
      const value = storage.getItem(key);
      return value === null ? undefined : JSON.parse(value);
    },
    async set(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    async remove(key) {
      storage.removeItem(key);
    },
  };
}

export function onTrackChange(api: SpicetifyApi, listener: () => void) {
  api.Player.addEventListener('songchange', listener);
  return () => api.Player.removeEventListener('songchange', listener);
}
