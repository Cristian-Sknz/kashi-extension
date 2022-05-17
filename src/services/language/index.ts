import { Lyrics } from '..';
import {
  getChineseLetters,
  getJapaneseLetters,
  hasKoreanLetters,
  hasRussianLetters,
} from './util';

export enum SupportedLanguages {
  Korean = 'Korean',
  Chinese = 'Chinese',
  Russian = 'Russian',
  Japanese = 'Japanese',
}

function detect(lyrics: Lyrics): Set<SupportedLanguages> {
  const languages = new Set<SupportedLanguages>();
  const { Chinese, Japanese, Korean, Russian } = SupportedLanguages;
  for (const { text } of lyrics) {
    const chinese = getChineseLetters(text);
    const japanese = getJapaneseLetters(text);
    if (hasKoreanLetters(text)) {
      languages.add(Korean);
    }
    
    if (hasRussianLetters(text)) {
      languages.add(Russian);
    }

    // The Japanese and Chinese languages ​​use some 'letters' in common, so this verification is necessary.
    if (chinese && japanese) {
      languages.add(japanese.length > chinese.length ? Japanese : Chinese);
    } else if (japanese) {
      languages.add(Japanese);
    } else if (chinese) {
      languages.add(Chinese);
    }
  }

  return languages;
}

export default detect;