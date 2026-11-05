import { startApp } from './app';
import { browserStore } from './platform/browser';

void startApp(browserStore, chrome.runtime.getURL('kuromoji/dict/')).catch(error =>
  console.warn('[Kashi] Could not start.', error),
);
