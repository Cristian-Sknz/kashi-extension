import { Lyrics } from '..';
import { getAllLanguages } from './util';

export enum SupportedLanguages {
  Korean = 'Korean',
  Chinese = 'Chinese',
  Russian = 'Russian',
  Japanese = 'Japanese',
}

const { Chinese, Japanese, Korean, Russian } = SupportedLanguages;

type DetectPredominant = { 
  lang: SupportedLanguages; 
  size: number;
};

function createPredominant(lang: SupportedLanguages, size: number) {
  return { lang, size }
}

/** Function to detect the predominant language of a song
 * 
 * @param lyrics lyrics object
 * @returns Set of SupportedLanguages detected
 */
function detectPredominant(lyrics: Lyrics): SupportedLanguages {
  const text = lyrics.map(({text}) => text).join(' ');
  const language: DetectPredominant[] = [];

  const { korean, russian, chinese, japanese } = getAllLanguages(text);

  if (korean) {
    language.push(createPredominant(Korean, korean.length));
  }
  
  if (russian) {
    language.push(createPredominant(Russian, russian.length));
  }

  // The Japanese and Chinese languages ​​use some 'letters' in common, so this verification is necessary.
  if (chinese && japanese) {
    language.push({
      lang: japanese.length > chinese.length ? Japanese : Chinese,
      size: Math.max(japanese.length, chinese.length),
    });
  } else if (japanese) {
    language.push(createPredominant(Japanese, japanese.length));
  } else if (chinese) {
    language.push(createPredominant(Chinese, chinese.length));
  }

  const predominant = language.find((value, index, array) => {
    const max = array.map(({size}) => size)
      .reduce((a, b) => Math.max(a, b), -Infinity);
    return value.size === max;
  });
  return predominant?.lang;
}

/** Function to detect all languages ​​in a song.
 * 
 * @param lyrics lyrics object
 * @returns Set of SupportedLanguages detected
 */
function detect(lyrics: Lyrics): Set<SupportedLanguages> {
  const languages = new Set<SupportedLanguages>();

  for (const { text } of lyrics) {
    const { korean, russian, chinese, japanese } = getAllLanguages(text);

    if (korean) {
      languages.add(Korean);
    }
    
    if (russian) {
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

export { detectPredominant }
export default detect;