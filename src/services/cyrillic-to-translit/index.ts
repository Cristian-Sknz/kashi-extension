import cyrillicToTranslit, { CyrillicToTranslit } from 'cyrillic-to-translit-js';
import RomanizeService, { Lyrics } from '..';
import { hasRussianLetters } from '../language/util';

export default class CyrillicToTranslitService implements RomanizeService {
  library: CyrillicToTranslit;

  constructor() {
    this.library = cyrillicToTranslit();
  }

  romanize(lyrics: Lyrics): Promise<Lyrics> {
    const data = lyrics.map(({ text }) => {
      if (hasRussianLetters(text)) {
        return this.library.transform(text);
      }
      return text;
    });

    for (var lyric of lyrics) {
      lyric.node.textContent = lyric.romaji = data[lyric.index];
    }
    return Promise.resolve(lyrics);
  }
}