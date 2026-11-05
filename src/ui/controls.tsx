import { createPortal, flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { LyricsState } from '../lyrics-controller';
import type { Settings } from '../services/settings';
import { SettingsPanel, SettingsTrigger } from './settings-panel';

const LYRICS_RADIO = 'button[role="radio"][value="lyrics"]';
const VIEWPORT_MARGIN = 12;

function findMediaGroup(document: Document) {
  const groups = [...document.querySelectorAll('[role="radiogroup"]')].filter(
    group => !group.closest('[hidden], [aria-hidden="true"]') && group.querySelector(LYRICS_RADIO),
  );
  return groups.find(group => group.getClientRects().length) ?? groups[0];
}

export function mountControls(
  document: Document,
  initialSettings: Settings,
  onChange: (settings: Settings) => void,
  onRetry: () => void,
) {
  const window = document.defaultView!;
  const triggerHost = document.createElement('span');
  triggerHost.dataset.kashiUi = 'trigger';
  const triggerShadow = triggerHost.attachShadow({ mode: 'open' });

  const popupHost = document.createElement('div');
  popupHost.dataset.kashiUi = 'popup';
  const popupShadow = popupHost.attachShadow({ mode: 'open' });
  const nativePopover =
    typeof popupHost.showPopover === 'function' && typeof popupHost.hidePopover === 'function';

  const root = createRoot(triggerShadow);
  let trigger: HTMLButtonElement | null = null;
  let panel: HTMLDivElement | null = null;
  let checkbox: HTMLInputElement | null = null;
  let mediaGroup: Element | undefined;
  let opened = false;
  let settings = initialSettings;
  let state: LyricsState = 'idle';
  let notice = '';

  const triggerRef = (element: HTMLButtonElement | null) => {
    trigger = element;
  };
  const panelRef = (element: HTMLDivElement | null) => {
    panel = element;
  };
  const checkboxRef = (element: HTMLInputElement | null) => {
    checkbox = element;
  };

  function render() {
    // Opening needs the committed DOM for popover positioning and focus in the same event.
    flushSync(() => {
      root.render(
        <>
          <SettingsTrigger buttonRef={triggerRef} opened={opened} onToggle={toggle} />
          {createPortal(
            <SettingsPanel
              panelRef={panelRef}
              checkboxRef={checkboxRef}
              nativePopover={nativePopover}
              opened={opened}
              settings={settings}
              state={state}
              notice={notice}
              onChange={onChange}
              onRetry={onRetry}
              onClose={() => close(true)}
              onPopoverToggle={syncPopover}
            />,
            popupShadow,
          )}
        </>,
      );
    });
  }

  function position() {
    if (!opened || !trigger || !panel) return;

    const anchor = trigger.getBoundingClientRect();
    const { width, height } = panel.getBoundingClientRect();
    const left = Math.min(anchor.right - width, window.innerWidth - width - VIEWPORT_MARGIN);
    const top = Math.min(anchor.bottom + 8, window.innerHeight - height - VIEWPORT_MARGIN);
    panel.style.left = `${Math.max(VIEWPORT_MARGIN, left)}px`;
    panel.style.top = `${Math.max(VIEWPORT_MARGIN, top)}px`;
  }

  function close(restoreFocus: boolean) {
    if (!opened) return;

    opened = false;
    if (nativePopover && panel?.matches(':popover-open')) panel.hidePopover();
    render();
    if (restoreFocus && trigger?.isConnected) trigger.focus();
  }

  function toggle() {
    if (opened) {
      close(true);
      return;
    }

    if (nativePopover) panel?.showPopover();
    opened = true;
    render();
    position();
    checkbox?.focus();
  }

  function syncPopover() {
    if (nativePopover && opened && !panel?.matches(':popover-open')) close(false);
  }

  function onPointerDown(event: PointerEvent) {
    const path = event.composedPath();
    if (!path.includes(popupHost) && !path.includes(triggerHost)) close(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!opened || event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    close(true);
  }

  function attachTrigger() {
    const nextGroup = findMediaGroup(document);
    if (
      nextGroup === mediaGroup &&
      (!nextGroup || triggerHost.previousElementSibling === nextGroup)
    ) {
      return;
    }

    close(false);
    mediaGroup = nextGroup;
    // Keep the trigger outside Spotify's radio group so it does not alter its navigation.
    if (mediaGroup) mediaGroup.after(triggerHost);
    else triggerHost.remove();
  }

  function placePopup() {
    close(false);
    // The top layer escapes the header's stacking context while keeping focus inside it.
    const parent = nativePopover ? triggerShadow : (document.fullscreenElement ?? document.body);
    parent.append(popupHost);
    attachTrigger();
  }

  render();
  placePopup();
  const observer = new MutationObserver(attachTrigger);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('fullscreenchange', placePopup);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('scroll', position, true);
  window.addEventListener('resize', position);

  return {
    host: popupHost,
    trigger: triggerHost,
    update(next: Settings, nextState: LyricsState, nextNotice = '') {
      if (settings === next && state === nextState && notice === nextNotice) return;
      settings = next;
      state = nextState;
      notice = nextNotice;
      render();
    },
    dispose() {
      observer.disconnect();
      document.removeEventListener('fullscreenchange', placePopup);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      root.unmount();
      popupHost.remove();
      triggerHost.remove();
    },
  };
}
