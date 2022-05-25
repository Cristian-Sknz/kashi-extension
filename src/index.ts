import React from 'react';
import { createRoot } from 'react-dom/client';

import EventEmitter from './event/EventEmitter';
import Indicator, { IndicatorProps } from './react/Indicator';
import { romanize } from './services';

import { applyStoredLyrics, storeLyrics } from './services/helper/storage';
import { getLyricParent, getLyricsFromParent } from './services/helper/dom';
import { LyricsState } from './react/hooks/lyrics-state';
import { Root } from './react/Indicator.style';

getRootElement().then((array) => {
  const portal = document.createElement('div');
  array[0].appendChild(portal).classList.add(Root);

  const react = createRoot(portal);
  react.render(React.createElement<IndicatorProps>(Indicator, {
    listener: initializeLyricObserver(array[1]),
  }));
});

function getRootElement() {
  return new Promise<Element[]>((resolve) => {
    var observer = new MutationObserver((context) => {
      const mutation = context[context.length - 1];
      const target = mutation.target as HTMLBodyElement;
      const root = target.querySelector('.main-view-container');
      const main = root?.querySelector(['.os-padding', 'main'].join(' '));

      if (main) {
        resolve([root, main]);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
    });
  });
}

function initializeLyricObserver(node: Element) {
  const emitter = new EventEmitter<LyricsState>();
  const observer = new MutationObserver(async (records) => {
    const parent = getLyricParent(records);

    if (!parent) {
      emitter.emit({ state: LyricsState.Idle });
      return;
    }

    if (parent.hasAttribute('kashi')) {
      emitter.emit({ state: LyricsState[parent.getAttribute('kashi')] });
      return;
    }

    emitter.emit({
      state: LyricsState.Loading,
      element: parent,
    });

    const title = document.title;
    const [isStored, lyrics] = await applyStoredLyrics({
      title,
      lyrics: getLyricsFromParent(parent),
    });

    if (isStored) {
      emitter.emit({
        state: LyricsState.Loaded,
        element: parent,
      });
      return;
    }

    await romanize(lyrics).then((values) => {
      emitter.emit({
        state: LyricsState.Loaded,
        element: parent,
      });

      if (!title.toLowerCase().includes('spotify')) {
        storeLyrics(title, values);
      }
    });
  });
  observer.observe(node, { childList: true, subtree: true });
  return emitter;
}