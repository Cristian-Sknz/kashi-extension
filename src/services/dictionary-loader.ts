// Replaces Kuromoji's Node/XHR loader only in browser builds. Keep the upstream parser.
import DynamicDictionaries from 'kuromoji/src/dict/DynamicDictionaries';
import { dictionaryFile } from 'kashi:dictionary';

class DictionaryLoader {
  constructor(private readonly path: string) {}

  load(callback: (error: unknown, dictionaries: DynamicDictionaries) => void) {
    const dictionaries = new DynamicDictionaries();
    const read = async (name: string) => {
      const bytes = await dictionaryFile(name, this.path);
      const stream = new Blob([new Uint8Array(bytes)])
        .stream()
        .pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).arrayBuffer();
    };
    const names = [
      'base',
      'check',
      'tid',
      'tid_pos',
      'tid_map',
      'cc',
      'unk',
      'unk_pos',
      'unk_map',
      'unk_char',
      'unk_compat',
      'unk_invoke',
    ];
    Promise.all(names.map(name => read(`${name}.dat.gz`)))
      .then(
        ([
          base,
          check,
          tokenInfo,
          tokenPositions,
          tokenMap,
          costs,
          unknown,
          unknownPositions,
          unknownMap,
          characters,
          compatible,
          invoke,
        ]) => {
          dictionaries.loadTrie(new Int32Array(base), new Int32Array(check));
          dictionaries.loadTokenInfoDictionaries(
            new Uint8Array(tokenInfo),
            new Uint8Array(tokenPositions),
            new Uint8Array(tokenMap),
          );
          dictionaries.loadConnectionCosts(new Int16Array(costs));
          dictionaries.loadUnknownDictionaries(
            new Uint8Array(unknown),
            new Uint8Array(unknownPositions),
            new Uint8Array(unknownMap),
            new Uint8Array(characters),
            new Uint32Array(compatible),
            new Uint8Array(invoke),
          );
          callback(null, dictionaries);
        },
      )
      .catch(error => callback(error, dictionaries));
  }
}

module.exports = DictionaryLoader;
