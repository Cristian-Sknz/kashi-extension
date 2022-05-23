import React from 'react';
import { createRoot } from 'react-dom/client'

import { Lyric, romanize } from './services';
import { LyricsState } from './react/hooks/lyrics-state';
import { Root } from './react/Indicator.style';
import Indicator, { IndicatorProps } from './react/Indicator';
import EventEmitter from './event/EventEmitter';

getRootElement().then((array) => {
  const portal = document.createElement('div');
  array[0].appendChild(portal).classList.add(Root);

  const react = createRoot(portal);
  react.render(React.createElement<IndicatorProps>(Indicator, {
    listener: initializeLyricObserver(array[1])
  }))
});

function getRootElement() {
  return new Promise<Element[]>((resolve) => {
    var observer = new MutationObserver((context) => {
      const mutation = context[context.length - 1];
      const target = mutation.target as HTMLBodyElement;
      const root = target.querySelector('.main-view-container');
      const main = root.querySelector(['.os-padding','main'].join(' '));

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
    const record = records.filter(({ addedNodes }) => addedNodes.length !== 0)
        .map<HTMLElement>((record) => record.target as HTMLElement)
        .find((e) =>  e.querySelector('[data-testid="fullscreen-lyric"]'));

    if (!record) {
      emitter.emit({ state: LyricsState.Idle });
      return;
    }

    const lyric = record.querySelector('[data-testid="fullscreen-lyric"]')
      .parentElement;
    if (lyric.hasAttribute('kashi')) {
      emitter.emit({ state: LyricsState[lyric.getAttribute('kashi')] });
      return;
    }
    
    const lyrics = Array.from(lyric.childNodes) as HTMLElement[];
    emitter.emit({
      state: LyricsState.Loading,
      element: lyric
    });
    
    await romanize(lyrics
      .filter((node) => node.hasAttribute('data-testid'))
      .map<Lyric>((value, index) => ({
        index: index,
        node: value,
        text: value.textContent
    })));

    emitter.emit({
      state: LyricsState.Loaded,
      element: lyric
    });
  });
  observer.observe(node, { childList: true, subtree: true });
  return emitter;
}