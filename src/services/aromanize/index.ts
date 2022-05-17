import Aromanize from 'aromanize/base';
import RomanizeService, { Lyrics } from '..';
import { hasKoreanLetters } from '../language/util';

export default class AromanizeService implements RomanizeService {
  romanize(lyrics: Lyrics): Promise<Lyrics> {
    const data = lyrics.map(({ text }) => {
      if (hasKoreanLetters(text)) {
        return Aromanize.romanize(text);
      }
      return text;
    });

    for (var lyric of lyrics) {
      lyric.node.textContent = lyric.romaji = data[lyric.index];
    }
    return Promise.resolve(lyrics);
  }
}