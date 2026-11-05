import type { JapaneseScript, Language } from '.';
import type { KeyValueStore } from '../platform/types';

export type Settings = { enabled: boolean; japaneseScript: JapaneseScript; language?: Language };
export const DEFAULT_SETTINGS: Settings = { enabled: true, japaneseScript: 'romaji' };
export const SETTINGS_KEY = 'kashi:settings:v1';
export const scripts: JapaneseScript[] = ['romaji', 'hiragana', 'katakana'];
export const languages: Language[] = ['Japanese', 'Chinese', 'Korean', 'Russian'];

export async function loadSettings(store: KeyValueStore): Promise<Settings> {
  try {
    const value = (await store.get(SETTINGS_KEY)) as Partial<Settings> | null;
    const language = languages.find(language => language === value?.language);
    const japaneseScript = scripts.find(script => script === value?.japaneseScript);

    return {
      enabled: typeof value?.enabled === 'boolean' ? value.enabled : DEFAULT_SETTINGS.enabled,
      japaneseScript: japaneseScript ?? DEFAULT_SETTINGS.japaneseScript,
      ...(language ? { language } : {}),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(store: KeyValueStore, settings: Settings) {
  return store.set(SETTINGS_KEY, settings);
}
