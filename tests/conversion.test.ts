import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { createConverter, detectLanguage } from '../src/services';

const convert = createConverter(resolve('public/kuromoji/dict'));
test('converts all four languages, preserves Latin text and distinguishes Cyrillic р from p', async () => {
  expect(
    await convert(
      [
        'р Р п p pop!',
        '안녕하세요',
        '한국어!',
        '호랑이',
        '汉语拼音',
        '睡着了',
        'Hello!',
        'Hello 中国!',
      ],
      { japaneseScript: 'romaji' },
    ),
  ).toEqual([
    'r R p p pop!',
    'annyeonghaseyo',
    'hangugeo!',
    'horangi',
    'hàn yǔ pīn yīn',
    'shuì zháo le',
    'Hello!',
    'Hello zhōng guó!',
  ]);
});

test('Japanese kana takes precedence over the number of Han characters', () => {
  expect(detectLanguage('世界地図音楽物語の歌')).toBe('Japanese');
  expect(detectLanguage('Hello')).toBeUndefined();
});

test('Japanese dictionary converts kanji and all requested scripts locally', async () => {
  expect(await convert(['かな'], { japaneseScript: 'romaji' })).toEqual(['ka na']);
  expect(await convert(['かな'], { japaneseScript: 'katakana' })).toEqual(['カナ']);
  expect(await convert(['カナ'], { japaneseScript: 'hiragana' })).toEqual(['かな']);
  expect(await convert(['日本語'], { japaneseScript: 'hiragana', language: 'Japanese' })).toEqual([
    'にほんご',
  ]);
}, 30000);
test('converts the conventional 其れ spelling as a whole word in every Japanese mode', async () => {
  expect(
    await convert(['其れ', '其れを'], { japaneseScript: 'romaji', language: 'Japanese' }),
  ).toEqual(['sore', 'sore wo']);
  expect(
    await convert(['其れ', '其れを'], { japaneseScript: 'hiragana', language: 'Japanese' }),
  ).toEqual(['それ', 'それを']);
  expect(
    await convert(['其れ', '其れを'], { japaneseScript: 'katakana', language: 'Japanese' }),
  ).toEqual(['ソレ', 'ソレヲ']);
  expect(await convert(['其'], { japaneseScript: 'romaji', language: 'Japanese' })).toEqual(['其']);
});

test('preserves non-Japanese spelling, symbols and spaces inside mixed lines', async () => {
  expect(await convert(['Hello  wiθ U! 此処に居て (test)'], { japaneseScript: 'romaji' })).toEqual([
    'Hello  wiθ U! koko ni i te (test)',
  ]);
  expect(await convert(['wiθ  カナ!'], { japaneseScript: 'hiragana' })).toEqual(['wiθ  かな!']);
  expect(await convert(['math θ + Φ'], { japaneseScript: 'romaji' })).toEqual(['math θ + Φ']);
});

test('uses wo for literal を and ヲ while preserving other Hepburn readings and kana modes', async () => {
  expect(
    await convert(['を', 'ヲ', 'をを', '本を読む', 'しお', 'wo を o'], {
      japaneseScript: 'romaji',
      language: 'Japanese',
    }),
  ).toEqual(['wo', 'wo', 'wo wo', 'hon wo yomu', 'shio', 'wo wo o']);
  expect(await convert(['本を読む'], { japaneseScript: 'hiragana', language: 'Japanese' })).toEqual(
    ['ほんをよむ'],
  );
  expect(await convert(['本を読む'], { japaneseScript: 'katakana', language: 'Japanese' })).toEqual(
    ['ホンヲヨム'],
  );
});
