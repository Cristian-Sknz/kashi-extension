type Layout = { width: number; delta: boolean };

// Group the bytes of each record by column so gzip sees related values together.
const layouts = new Map<string, Layout>([
  ['base.dat.gz', { width: 4, delta: true }],
  ['check.dat.gz', { width: 4, delta: true }],
  ['cc.dat.gz', { width: 2, delta: true }],
  ['tid.dat.gz', { width: 10, delta: true }],
  ['tid_map.dat.gz', { width: 4, delta: false }],
]);

export function dictionaryLayout(name: string) {
  return layouts.get(name);
}

export function dictionaryAssetName(name: string) {
  return dictionaryLayout(name) ? name.replace('.gz', '.packed.gz') : name;
}

export function packDictionaryBytes(bytes: Uint8Array, { width, delta }: Layout) {
  const records = Math.floor(bytes.length / width);
  const packed = new Uint8Array(bytes.length);

  for (let column = 0; column < width; column++) {
    const offset = column * records;
    let previous = 0;
    for (let record = 0; record < records; record++) {
      const value = bytes[record * width + column];
      packed[offset + record] = delta ? value - previous : value;
      previous = value;
    }
  }

  packed.set(bytes.subarray(records * width), records * width);
  return packed;
}

export function unpackDictionaryBytes(name: string, buffer: ArrayBuffer): ArrayBuffer {
  const layout = dictionaryLayout(name);
  if (!layout) return buffer;

  const { width, delta } = layout;
  const packed = new Uint8Array(buffer);
  const bytes = new Uint8Array(packed.length);
  const records = Math.floor(bytes.length / width);

  for (let column = 0; column < width; column++) {
    const offset = column * records;
    let previous = 0;
    for (let record = 0; record < records; record++) {
      const stored = packed[offset + record];
      const value = delta ? (previous + stored) & 0xff : stored;
      bytes[record * width + column] = value;
      previous = value;
    }
  }

  bytes.set(packed.subarray(records * width), records * width);
  return bytes.buffer;
}
