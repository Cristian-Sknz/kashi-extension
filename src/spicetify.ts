import { startApp } from './app';
import { desktopStore, onTrackChange, waitForSpicetify } from './platform/spicetify';

void waitForSpicetify()
  .then(api =>
    startApp(desktopStore(window.localStorage), 'embedded://dictionary/', listener =>
      onTrackChange(api, listener),
    ),
  )
  .catch(error => console.warn('[Kashi] Could not start desktop extension.', error));
