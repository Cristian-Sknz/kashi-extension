import { afterEach, expect, test } from 'bun:test';
import { DEFAULT_SETTINGS } from '../src/services/settings';
import { mountControls } from '../src/ui/controls';

const mediaHeader = await Bun.file(
  new URL('./fixtures/spotify-media-header.html', import.meta.url),
).text();
const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup.splice(0).forEach(dispose => dispose());
  document.body.replaceChildren();
});
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
test('settings controls have labels, update options and dispose cleanly', () => {
  document.body.innerHTML = mediaHeader + '<main></main>';
  let next = DEFAULT_SETTINGS,
    retried = false;
  const ui = mountControls(
    document,
    DEFAULT_SETTINGS,
    value => {
      next = value;
    },
    () => {
      retried = true;
    },
  );
  cleanup.push(ui.dispose);
  const shadow = ui.host.shadowRoot!;
  const trigger = ui.trigger.shadowRoot!.querySelector('button')!;
  trigger.click();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(shadow.querySelector<HTMLElement>('[role="dialog"]')!.hidden).toBe(false);
  const checkbox = shadow.querySelector('input')!;
  expect(checkbox.closest('label')!.textContent).toContain('Convert lyrics');
  checkbox.click();
  expect(next.enabled).toBe(false);
  ui.update(next, 'idle');
  expect(shadow.querySelector('select')!.disabled).toBe(true);
  ui.update(DEFAULT_SETTINGS, 'error');
  shadow.querySelector<HTMLButtonElement>('[data-retry]')!.click();
  expect(retried).toBe(true);
  expect(shadow.querySelector('[role="status"]')!.textContent).toBe('Conversion failed');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(ui.trigger.shadowRoot!.activeElement === trigger).toBe(true);
});

test('header icon mounts late, survives header replacement, and does not alter Spotify radios', async () => {
  document.body.innerHTML =
    '<main></main><div role="radiogroup"><button role="radio" value="unrelated">Other</button></div>';
  const ui = mountControls(
    document,
    DEFAULT_SETTINGS,
    () => {},
    () => {},
  );
  cleanup.push(ui.dispose);
  expect(ui.trigger.isConnected).toBe(false);
  document.body.insertAdjacentHTML('beforeend', mediaHeader);
  await tick();
  const group = document.querySelector('[data-test-media-header] [role="radiogroup"]')!;
  expect(ui.trigger.previousElementSibling === group).toBe(true);
  expect(group.querySelectorAll('button[role="radio"]')).toHaveLength(4);
  const trigger = ui.trigger.shadowRoot!.querySelector('button')!;
  trigger.click();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(group.querySelector('[aria-checked="true"]')!.getAttribute('value')).toBe('lyrics');
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  ui.trigger.remove();
  await tick();
  expect(ui.trigger.previousElementSibling === group).toBe(true);
  trigger.click();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  document.querySelector('[data-test-media-header]')!.remove();
  await tick();
  expect(ui.trigger.isConnected).toBe(false);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  document.body.insertAdjacentHTML(
    'beforeend',
    mediaHeader.replace('Opções de controle de mídia', 'Media controls'),
  );
  await tick();
  expect(ui.trigger.isConnected).toBe(true);
  expect(document.querySelectorAll('[data-kashi-ui="trigger"]')).toHaveLength(1);
  ui.dispose();
  document.body.insertAdjacentHTML('beforeend', '<div>remount</div>');
  await tick();
  expect(document.querySelectorAll('[data-kashi-ui]')).toHaveLength(0);
});

test('popup stays open when the player redirects focus outside Kashi', () => {
  document.body.innerHTML = mediaHeader + '<button id="player">Player</button>';
  const ui = mountControls(
    document,
    DEFAULT_SETTINGS,
    () => {},
    () => {},
  );
  cleanup.push(ui.dispose);
  const redirect = (event: Event) => {
    if (event.composedPath().includes(ui.host))
      document.querySelector<HTMLButtonElement>('#player')!.focus();
  };
  document.addEventListener('focusin', redirect, true);
  cleanup.push(() => document.removeEventListener('focusin', redirect, true));
  const trigger = ui.trigger.shadowRoot!.querySelector('button')!;
  trigger.click();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(ui.host.shadowRoot!.querySelector<HTMLElement>('[role="dialog"]')!.hidden).toBe(false);
});

test('controls escape the lyrics stacking context and follow fullscreen without orphaning listeners', () => {
  document.body.innerHTML =
    '<main style="isolation:isolate;transform:translateZ(0);pointer-events:none"><section></section></main>';
  const ui = mountControls(
    document,
    DEFAULT_SETTINGS,
    () => {},
    () => {},
  );
  cleanup.push(ui.dispose);
  expect(ui.host.parentElement === document.body).toBe(true);
  const fullscreen = document.querySelector('section')!;
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: fullscreen });
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(ui.host.parentElement === fullscreen).toBe(true);
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(ui.host.parentElement === document.body).toBe(true);
  ui.dispose();
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(ui.host.isConnected).toBe(false);
});
