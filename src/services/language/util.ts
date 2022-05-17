export function getRussianLetters(str: string) {
  return str.match(/[\wа-я]+/ig);
}

export function hasRussianLetters(str: string) {
  return !!getRussianLetters(str);
}

export function getKoreanLetters(str: string) {
  return str.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
}

export function hasKoreanLetters(str: string) {
  return !!getKoreanLetters(str);
}

export function getJapaneseLetters(str: string) {
  return str.match(/[ぁ-んァ-ン]/g);
}

export function hasJapaneseLetters(str: string) {
  return !!getJapaneseLetters(str);
}

export function getChineseLetters(str: string) {
  return str.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]/g);
}

export function hasChineseLetters(str: string) {
  return !!getChineseLetters(str);
}