import { Lyric } from '..';

export function getLyricParent(records: MutationRecord[]) {
  const record = records
    .filter(({ addedNodes }) => addedNodes.length !== 0)
    .map<HTMLElement>((record) => record.target as HTMLElement)
    .find((e) => e?.querySelector('[data-testid="fullscreen-lyric"]'));

  return record?.querySelector('[data-testid="fullscreen-lyric"]').parentElement;
}

export function getLyricsFromParent(parent: HTMLElement) {
  if (!parent) return null;

  const nodes = Array.from(parent.childNodes) as HTMLElement[];
  return nodes
    .filter((node) => node.hasAttribute('data-testid'))
    .map<Lyric>((value, index) => ({
      index: index,
      node: value,
      text: value.textContent,
    }));
}
