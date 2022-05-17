import RomanizeService, { Lyrics } from '..';
import pinyin from 'pinyin';
import { hasChineseLetters } from '../language/util';

export default class PinyinService implements RomanizeService {
  romanize(lyrics: Lyrics): Promise<Lyrics> {
    const data = lyrics.map(({ text }) => {
      if (hasChineseLetters(text)) {
        return pinyin(text).flatMap((value) => value).join(' ');
      }
      return text;
    });

    for (var lyric of lyrics) {
      lyric.node.textContent = lyric.romaji = data[lyric.index];
    }
    return Promise.resolve(lyrics);
  }
}