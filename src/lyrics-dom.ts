// Desktop builds can strip test IDs. Scope their structural hook to Spotify's lyrics colors.
export const LINE_SELECTOR =
  '[data-testid="lyrics-line"], [data-testid="fullscreen-lyric"], [style*="--lyrics-color-active"] div[dir="auto"]';

const SHOW_TEXT = 4; // NodeFilter.SHOW_TEXT

export function findLyricTextNodes(document: Document): Text[] {
  const lines: Text[] = [];

  for (const line of document.querySelectorAll(LINE_SELECTOR)) {
    if (line.closest('[data-kashi-ui]') || line.querySelector(LINE_SELECTOR)) continue;

    const walker = document.createTreeWalker(line, SHOW_TEXT);
    const texts: Text[] = [];
    while (walker.nextNode()) {
      const text = walker.currentNode as Text;
      if (text.data.trim() && !text.parentElement?.closest('button, a, [aria-hidden="true"]')) {
        texts.push(text);
      }
    }

    // Multiple text nodes may belong to individually timed or annotated words.
    if (texts.length === 1) lines.push(texts[0]);
  }

  return lines;
}
