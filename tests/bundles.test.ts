import { beforeAll, test, expect } from 'bun:test';
import { Window, type HTMLSelectElement } from 'happy-dom';
import { build } from '../scripts/build';

beforeAll(() => build(), 30000);
const mediaHeader = await Bun.file(
  new URL('./fixtures/spotify-media-header.html', import.meta.url),
).text();
async function eventually(check: () => boolean) {
  const end = Date.now() + 15000;
  while (!check()) {
    if (Date.now() > end) throw Error('Bundle did not reach the expected state.');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

for (const target of ['web', 'spicetify'])
  test(`${target} bundle converts Japanese with real browser loader, restores and reinjects safely`, async () => {
    const browser = new Window({ url: 'https://open.spotify.com/lyrics' });
    const listeners = new Set<() => void>();
    let reads = 0;
    Object.assign(browser, {
      console,
      Blob,
      Response,
      DecompressionStream,
      async fetch(input: string | URL) {
        reads++;
        if (target === 'spicetify') throw Error('Desktop must work without network.');
        const name = new URL(String(input)).pathname.split('/').pop()!;
        return new Response(await Bun.file(`dist/web/kuromoji/dict/${name}`).arrayBuffer());
      },
      chrome: {
        runtime: { getURL: (path: string) => `https://extension.invalid/${path}` },
        storage: {
          local: {
            async get(key: string) {
              return { [key]: JSON.parse(browser.localStorage.getItem(key) ?? 'null') };
            },
            async set(values: Record<string, unknown>) {
              for (const [key, value] of Object.entries(values))
                browser.localStorage.setItem(key, JSON.stringify(value));
            },
          },
        },
      },
      Spicetify: {
        Player: {
          addEventListener(_event: string, listener: () => void) {
            listeners.add(listener);
          },
          removeEventListener(_event: string, listener: () => void) {
            listeners.delete(listener);
          },
        },
      },
    });
    browser.document.body.innerHTML = mediaHeader;
    const file = `dist/${target}/${target === 'web' ? 'content' : 'kashi'}.js`;
    const code = await Bun.file(file).text();
    try {
      browser.eval(code);
      await eventually(() => !!browser.document.querySelector('[data-kashi-ui="trigger"]'));
      const trigger = browser.document
        .querySelector('[data-kashi-ui="trigger"]')!
        .shadowRoot!.querySelector('button')!;
      trigger.click();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const shadow = browser.document.querySelector('[data-kashi-ui="popup"]')!.shadowRoot!;
      expect(shadow.querySelector('[role="status"]')!.textContent).toBe('Waiting for lyrics');
      const hook = target === 'web' ? 'data-testid="lyrics-line"' : '';
      browser.document.body.insertAdjacentHTML(
        'beforeend',
        `<main><section style="--lyrics-color-active:#fff"><div dir="auto" ${hook}>かな</div><div dir="auto" ${hook}><span>日本語</span></div><div dir="auto" ${hook} data-case="pronoun">其れ</div><div dir="auto" ${hook} data-case="mixed">wiθ U 日本語</div><div dir="auto" ${hook} data-case="wo">本を読む</div></section></main>`,
      );
      const line = browser.document.querySelector('section > div')!;
      await eventually(() => line.textContent === 'ka na');
      expect(browser.document.querySelector('[data-case="pronoun"]')!.textContent).toBe('sore');
      expect(browser.document.querySelector('[data-case="mixed"]')!.textContent).toBe(
        'wiθ U nihongo',
      );
      expect(browser.document.querySelector('[data-case="wo"]')!.textContent).toBe('hon wo yomu');
      const script = shadow.querySelector<HTMLSelectElement>('[data-script]')!;
      script.value = 'hiragana';
      script.dispatchEvent(new browser.Event('change', { bubbles: true }));
      await eventually(
        () => browser.document.querySelector('section span')!.textContent === 'にほんご',
      );
      expect(browser.document.querySelector('[data-case="pronoun"]')!.textContent).toBe('それ');
      expect(browser.document.querySelector('[data-case="mixed"]')!.textContent).toBe(
        'wiθ U にほんご',
      );
      expect(browser.document.querySelector('[data-case="wo"]')!.textContent).toBe('ほんをよむ');
      // Native renderer overwrites the existing text node while the line is active.
      line.firstChild!.textContent = 'かな';
      await eventually(
        () => shadow.querySelector('[role="status"]')!.textContent === 'Converted locally',
      );
      const enabled = shadow.querySelector('input')!;
      enabled.click();
      expect(browser.document.querySelector('section span')!.textContent).toBe('日本語');
      expect(browser.document.querySelector('[data-case="pronoun"]')!.textContent).toBe('其れ');
      expect(browser.document.querySelector('[data-case="wo"]')!.textContent).toBe('本を読む');
      await eventually(
        () =>
          JSON.parse(browser.localStorage.getItem('kashi:settings:v1') ?? '{}').enabled === false,
      );
      browser.eval(code);
      await eventually(() => browser.document.querySelectorAll('[data-kashi-ui]').length === 2);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(browser.document.querySelectorAll('[data-kashi-ui="trigger"]')).toHaveLength(1);
      expect(browser.document.querySelectorAll('[data-kashi-ui="popup"]')).toHaveLength(1);
      expect(
        browser.document
          .querySelector('[data-kashi-ui="trigger"]')!
          .shadowRoot!.querySelector('button')!
          .getAttribute('aria-expanded'),
      ).toBe('false');
      expect(listeners.size).toBe(target === 'spicetify' ? 1 : 0);
      expect(reads).toBe(target === 'spicetify' ? 0 : 12);
      (browser as unknown as { __kashiDispose(): void }).__kashiDispose();
      expect(listeners.size).toBe(0);
    } finally {
      await browser.happyDOM.close();
    }
  }, 30000);
