import { afterEach, expect, test } from 'bun:test';
import { startLyricsController } from '../src/lyrics-controller';
import type { Convert } from '../src/services';
import { findLyricTextNodes } from '../src/lyrics-dom';
import { DEFAULT_SETTINGS } from '../src/services/settings';

const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup.splice(0).forEach(dispose => dispose());
  document.body.replaceChildren();
});
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
function lyrics(text = '原文') {
  document.body.innerHTML = `<main><section><div data-testid="lyrics-line" role="button"><span>${text}</span><button aria-label="Seek"></button></div></section></main>`;
  return document.querySelector('[data-testid="lyrics-line"] span')!;
}
function start(convert: Convert, settings = DEFAULT_SETTINGS) {
  const controller = startLyricsController({ document, convert, settings, onState() {} });
  cleanup.push(controller.dispose);
  return controller;
}

test('restores Spotify rewrites and preserves original nodes and click handlers (issue #2)', async () => {
  const leaf = lyrics();
  const text = leaf.firstChild;
  let clicks = 0,
    conversions = 0;
  leaf.parentElement!.addEventListener('click', () => clicks++);
  const controller = start(async () => {
    conversions++;
    return ['romaji'];
  });
  await tick();
  expect(leaf.textContent).toBe('romaji');
  leaf.firstChild!.textContent = '原文';
  await tick();
  expect(leaf.textContent).toBe('romaji');
  expect(leaf.firstChild).toBe(text);
  expect(conversions).toBe(1);
  (leaf as HTMLElement).click();
  expect(clicks).toBe(1);
  controller.setSettings({ ...DEFAULT_SETTINGS, enabled: false });
  expect(leaf.textContent).toBe('原文');
});

test('detects late mounting, replacement text nodes and reused lines', async () => {
  let calls = 0;
  start(async texts => {
    calls++;
    return texts.map(text => text.toUpperCase());
  });
  const leaf = lyrics('first');
  await tick();
  expect(leaf.textContent).toBe('FIRST');
  leaf.textContent = 'second';
  await tick();
  expect(leaf.textContent).toBe('SECOND');
  leaf.firstChild!.textContent = 'third';
  await tick();
  expect(leaf.textContent).toBe('THIRD');
  expect(calls).toBe(3);
});

test('ignores stale asynchronous results after content changes', async () => {
  const leaf = lyrics('first');
  const pending: ((values: string[]) => void)[] = [];
  start(() => new Promise(resolve => pending.push(resolve)));
  leaf.firstChild!.textContent = 'second';
  await tick();
  pending[0]!(['WRONG']);
  await tick();
  expect(leaf.textContent).toBe('second');
  pending[1]!(['SECOND']);
  await tick();
  expect(leaf.textContent).toBe('SECOND');
});

test('disabling, changing mode and disposing cancel pending conversion', async () => {
  const leaf = lyrics();
  const pending: ((values: string[]) => void)[] = [];
  const controller = start(() => new Promise(resolve => pending.push(resolve)));
  controller.setSettings({ enabled: true, japaneseScript: 'katakana' });
  pending[0]!(['OLD']);
  await tick();
  expect(leaf.textContent).toBe('原文');
  pending[1]!(['カタカナ']);
  await tick();
  expect(leaf.textContent).toBe('カタカナ');
  controller.setSettings({ ...DEFAULT_SETTINGS, enabled: false });
  expect(leaf.textContent).toBe('原文');
  controller.setSettings(DEFAULT_SETTINGS);
  controller.dispose();
  pending[2]!(['LATE']);
  await tick();
  expect(leaf.textContent).toBe('原文');
});

test('keeps word-timed/annotated markup intact and handles nested hooks once', () => {
  document.body.innerHTML =
    '<div data-testid="lyrics-line"><span data-testid="fullscreen-lyric">かな</span></div><div data-testid="lyrics-line"><span>one</span><span>two</span></div>';
  expect(findLyricTextNodes(document)).toHaveLength(1);
  expect(findLyricTextNodes(document)[0]!.data).toBe('かな');
});

test('detects desktop lines when Spicetify removes test IDs, preserving seek and credits', async () => {
  document.body.innerHTML =
    '<header><div dir="auto">Album</div></header><main><section style="--lyrics-color-active:#fff"><div dir="auto"><div>かな</div></div><div dir="auto"><div></div></div><p dir="auto">Lyrics provider</p></section></main>';
  expect(findLyricTextNodes(document)).toHaveLength(1);
  const leaf = document.querySelector('section div[dir="auto"] div')!;
  let seeks = 0;
  leaf.parentElement!.addEventListener('click', () => seeks++);
  const controller = start(async texts => texts.map(() => 'kana'));
  await tick();
  expect(leaf.textContent).toBe('kana');
  (leaf as HTMLElement).click();
  expect(seeks).toBe(1);
  expect(document.querySelector('header')!.textContent).toBe('Album');
  expect(document.querySelector('p')!.textContent).toBe('Lyrics provider');
  leaf.textContent = 'つぎ';
  await tick();
  expect(leaf.textContent).toBe('kana');
  controller.setSettings({ ...DEFAULT_SETTINGS, enabled: false });
  expect(leaf.textContent).toBe('つぎ');
});

test('leaving and reopening lyrics restores the detached view and reattaches cleanly', async () => {
  const leaf = lyrics('first');
  start(async texts => texts.map(text => text.toUpperCase()));
  await tick();
  document.querySelector('main')!.remove();
  await tick();
  expect(leaf.textContent).toBe('first');
  const second = lyrics('second');
  await tick();
  expect(second.textContent).toBe('SECOND');
});

test('conversion failure exposes an error and retry without a mutation loop', async () => {
  lyrics();
  let state = '',
    calls = 0;
  const controller = startLyricsController({
    document,
    settings: DEFAULT_SETTINGS,
    async convert() {
      if (++calls === 1) throw new Error('Expected test failure');
      return ['ok'];
    },
    onState(value) {
      state = value;
    },
  });
  cleanup.push(controller.dispose);
  await tick();
  expect(state).toBe('error');
  expect(calls).toBe(1);
  controller.invalidate();
  await tick();
  expect(state).toBe('ready');
  expect(calls).toBe(2);
});
