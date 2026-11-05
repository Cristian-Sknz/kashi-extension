declare module 'kashi:dictionary' {
  export function dictionaryFile(name: string, path: string): Promise<Uint8Array>;
}
declare module 'kuromoji/src/dict/DynamicDictionaries' {
  export default class DynamicDictionaries {
    loadTrie(base: Int32Array, check: Int32Array): void;
    loadTokenInfoDictionaries(...buffers: Uint8Array[]): void;
    loadConnectionCosts(costs: Int16Array): void;
    loadUnknownDictionaries(...buffers: (Uint8Array | Uint32Array)[]): void;
  }
}
declare module '*.css' {
  const css: string;
  export default css;
}
