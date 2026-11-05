import { createConverter } from './services';
import { loadSettings, saveSettings, type Settings } from './services/settings';
import { createCachedConverter } from './services/conversion-cache';
import { startLyricsController, type LyricsState } from './lyrics-controller';
import { mountControls } from './ui/controls';
import type { KeyValueStore } from './platform/types';

declare global {
  interface Window {
    __kashiDispose?: () => void;
  }
}

export async function startApp(
  store: KeyValueStore,
  dictionaryUrl: string,
  subscribe?: (invalidate: () => void) => () => void,
) {
  window.__kashiDispose?.();
  let active = true;
  let controller: ReturnType<typeof startLyricsController> | undefined;
  let controls: ReturnType<typeof mountControls> | undefined;
  let unsubscribe: (() => void) | undefined;
  let state: LyricsState = 'idle';
  let notice = '';
  let writes = Promise.resolve();
  const dispose = () => {
    active = false;
    controller?.dispose();
    controls?.dispose();
    unsubscribe?.();
    window.removeEventListener('pagehide', dispose);
    if (window.__kashiDispose === dispose) delete window.__kashiDispose;
  };
  window.__kashiDispose = dispose;
  window.addEventListener('pagehide', dispose);
  let settings = await loadSettings(store);
  if (!active) return dispose;
  const change = (next: Settings) => {
    settings = next;
    notice = '';
    controller?.setSettings(next);
    writes = writes
      .then(() => saveSettings(store, next))
      .catch(() => {
        if (active) {
          notice = 'Settings could not be saved';
          render();
        }
      });
  };
  const render = () => {
    if (!active) return;
    controls?.update(settings, state, notice);
  };
  controls = mountControls(document, settings, change, () => controller?.invalidate());
  controller = startLyricsController({
    document,
    settings,
    convert: createCachedConverter(createConverter(dictionaryUrl), store, Kashi.version),
    onState(next) {
      state = next;
      render();
    },
  });
  unsubscribe = subscribe?.(() => controller?.invalidate());
  return dispose;
}
