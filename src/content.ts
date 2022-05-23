import { Lyric, romanize } from './services';

getRootElement().then((root) => {
  initializeLyricObserver(root)
});

function getRootElement() {
  return new Promise<HTMLElement>((resolve) => {
    var observer = new MutationObserver((context) => {
      const mutation = context[context.length - 1];
      const target = mutation.target as HTMLBodyElement;
      const root = target.querySelector([
        '.main-view-container',
        '.os-padding',
        'main'
      ].join(' '));

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
  new MutationObserver(async (records) => {
    const record = records.find(({ addedNodes }) => addedNodes.length !== 0);
    if (!record) {
      return;
    }

    const lyric = (record.target as HTMLElement)
      .querySelector('[data-testid="fullscreen-lyric"]');

    const wrapper = lyric?.parentElement || null;

    if (!wrapper || wrapper.hasAttribute('kashi')) {
      return;
    }

    wrapper.setAttribute('kashi', '');
    const lyrics = Array.from(wrapper.childNodes) as HTMLElement[];

    await romanize(lyrics
      .filter((node) => node.hasAttribute('data-testid'))
      .map<Lyric>((value, index) => ({
        index: index,
        node: value,
        text: value.textContent
    })));
  }).observe(node, { 
    childList: true,
    subtree: true
  });
}