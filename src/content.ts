import { Lyric, toRomaji } from './services/kuroshiro';

getRootElement().then((root) => {
  initializeLyricObserver(root)
});

function getRootElement() {
  return new Promise<HTMLElement>((resolve) => {
    var observer = new MutationObserver((context) => {
      const mutation = context[context.length - 1];
      const target = mutation.target as HTMLBodyElement;
      const root = target.querySelector('.main-view-container');

      if (root) {
        resolve(root as HTMLElement);
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

function initializeLyricObserver(node: HTMLElement) {
  var romanize = toRomaji

  new MutationObserver(async (context) => {
    const mutation = context[context.length - 1];
    const target = mutation.target as HTMLElement;

    const lyric = target.querySelector('[data-testid="fullscreen-lyric"]');
    const wrapper = lyric?.parentElement || null;

    if (!wrapper || wrapper.hasAttribute('kashi')) {
      return;
    }

    wrapper.setAttribute('kashi', 'loading');
    await romanize(Array.from(wrapper.childNodes).map<Lyric>((value, index) => ({
      index: index,
      node: value,
      text: value.textContent
    })));
    wrapper.setAttribute('kashi', 'loaded');
  }).observe(node, { 
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
  });
}