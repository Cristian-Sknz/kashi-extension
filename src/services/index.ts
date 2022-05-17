import detect, { SupportedLanguages } from './language';

import AromanizeService from './aromanize';
import CyrillicToTranslitService from './cyrillic-to-translit';
import KuroshiroService from './kuroshiro';
import PinyinService from './pinyin';

export type Lyric = {
  index: number;
  node: Node;
  text: string;
  romaji?: string;
};

export type Lyrics = Lyric[];

export default interface RomanizeService {
  romanize(lyrics: Lyrics): Promise<Lyrics>;
}

type Services = {
  [key in SupportedLanguages]: RomanizeService;
};

const languages: Services = {
  Korean: new AromanizeService(),
  Japanese: new KuroshiroService(),
  Chinese: new PinyinService(),
  Russian: new CyrillicToTranslitService()
}

export async function romanize(lyrics: Lyrics) {
  const main = [...detect(lyrics)][0];
  if (main) {
    return languages[main].romanize(lyrics);
  }
  return lyrics;
}