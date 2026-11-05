import { Window } from 'happy-dom';
const window = new Window({ url: 'https://open.spotify.com/lyrics' });
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'Node',
  'Text',
  'MutationObserver',
  'Event',
  'CustomEvent',
] as const) {
  Object.defineProperty(globalThis, key, {
    value: key === 'window' ? window : window[key],
    configurable: true,
  });
}
