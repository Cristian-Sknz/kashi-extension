import type { Convert } from './services';
import type { Settings } from './services/settings';
import { findLyricTextNodes, LINE_SELECTOR } from './lyrics-dom';

export type LyricsState = 'idle' | 'loading' | 'ready' | 'error';

type Line = { text: Text; original: string; output?: string };
type Options = {
  document: Document;
  convert: Convert;
  settings: Settings;
  onState(state: LyricsState): void;
};

function isTrackedText(line: Line) {
  return line.text.data === line.original || line.text.data === line.output;
}

function restore(line: Line) {
  if (line.text.data === line.output) line.text.data = line.original;
}

export function startLyricsController({
  document,
  convert,
  settings: initialSettings,
  onState,
}: Options) {
  let settings = { ...initialSettings };
  let lines = new Map<Text, Line>();
  let revision = 0;
  let requestedRevision = -1;
  let stopped = false;
  let scheduled = false;

  function schedule() {
    if (scheduled || stopped) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (!stopped) reconcile();
    });
  }

  function refreshLines() {
    const texts = findLyricTextNodes(document);
    const next = new Map<Text, Line>();
    let changed = texts.length !== lines.size;

    for (const text of texts) {
      const previous = lines.get(text);
      if (previous && isTrackedText(previous)) {
        next.set(text, previous);
      } else {
        next.set(text, { text, original: text.data });
        changed = true;
      }
    }

    for (const [text, line] of lines) {
      if (!next.has(text)) restore(line);
    }
    lines = next;
    if (changed) revision++;
  }

  function reconcile() {
    refreshLines();

    if (lines.size === 0 || !settings.enabled) {
      lines.forEach(restore);
      onState('idle');
      return;
    }

    const snapshot = [...lines.values()];
    if (snapshot.every(line => line.output !== undefined)) {
      for (const { text, output } of snapshot) {
        if (output !== undefined && text.data !== output) text.data = output;
      }
      onState('ready');
      return;
    }

    if (requestedRevision === revision) return;
    const jobRevision = revision;
    requestedRevision = jobRevision;

    onState('loading');
    void convert(
      snapshot.map(line => line.original),
      settings,
    )
      .then(values => {
        // A track, setting or DOM change can invalidate the job while conversion is running.
        if (stopped || jobRevision !== revision || !settings.enabled) return;
        if (values.length !== snapshot.length || values.some(value => typeof value !== 'string')) {
          throw new Error('Invalid conversion result.');
        }

        for (const [index, line] of snapshot.entries()) {
          if (!line.text.isConnected || !isTrackedText(line)) {
            schedule();
            continue;
          }
          const output = values[index];
          line.output = output;
          if (line.text.data !== output) line.text.data = output;
        }
        onState('ready');
      })
      .catch(error => {
        if (stopped || jobRevision !== revision) return;
        console.warn('[Kashi] Conversion failed.', error);
        onState('error');
      });
  }

  function affectsLyrics(record: MutationRecord) {
    const target = record.target;
    const element =
      target.nodeType === Node.ELEMENT_NODE ? (target as Element) : target.parentElement;
    if (element?.closest('[data-kashi-ui]')) return false;

    if (record.type === 'characterData') {
      const line = lines.get(target as Text);
      return line ? line.text.data !== line.output : Boolean(element?.closest(LINE_SELECTOR));
    }

    if (element?.closest(LINE_SELECTOR)) return true;
    return [...record.addedNodes, ...record.removedNodes].some(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const element = node as Element;
      return element.matches(LINE_SELECTOR) || element.querySelector(LINE_SELECTOR);
    });
  }

  const observer = new MutationObserver(records => {
    if (records.some(affectsLyrics)) schedule();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  reconcile();

  return {
    setSettings(next: Settings) {
      if (stopped) return;
      revision++;
      for (const line of lines.values()) {
        restore(line);
        line.output = undefined;
      }
      settings = { ...next };
      reconcile();
    },
    invalidate() {
      if (stopped) return;
      revision++;
      lines.forEach(restore);
      lines.clear();
      schedule();
    },
    dispose() {
      stopped = true;
      revision++;
      observer.disconnect();
      lines.forEach(restore);
      lines.clear();
    },
  };
}
