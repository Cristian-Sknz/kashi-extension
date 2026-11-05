import { expect, test } from 'bun:test';
import { desktopStore, onTrackChange, waitForSpicetify } from '../src/platform/spicetify';
import { SETTINGS_KEY, loadSettings, saveSettings } from '../src/services/settings';

test('desktop storage uses local keys, waits with a bound, and unregisters song events', async () => {
  const memory = desktopStore(window.localStorage);
  await saveSettings(memory, { enabled: false, japaneseScript: 'hiragana' });
  expect((await loadSettings(memory)).enabled).toBe(false);
  await memory.remove(SETTINGS_KEY);
  let listener: (() => void) | undefined;
  const api = {
    Player: {
      addEventListener(_event: string, fn: () => void) {
        listener = fn;
      },
      removeEventListener() {
        listener = undefined;
      },
    },
  };
  expect(await waitForSpicetify(() => api, 0)).toBe(api);
  await expect(waitForSpicetify(() => undefined, 0)).rejects.toThrow('Spicetify.Player');
  let changes = 0;
  const remove = onTrackChange(api, () => changes++);
  listener!();
  remove();
  expect(changes).toBe(1);
  expect(listener).toBeUndefined();
});
