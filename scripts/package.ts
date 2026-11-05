import { join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { zipSync, type Zippable } from 'fflate';

const root = resolve(import.meta.dir, '..');
await mkdir(join(root, 'build'), { recursive: true });
for (const [directory, filename] of [
  ['web', 'Kashi-Web.zip'],
  ['spicetify', 'Kashi-Spicetify.zip'],
]) {
  const files: Zippable = {};
  const cwd = join(root, 'dist', directory!);
  for await (const name of new Bun.Glob('**/*').scan({ cwd, onlyFiles: true })) {
    files[name.replaceAll('\\', '/')] = [
      new Uint8Array(await Bun.file(join(cwd, name)).arrayBuffer()),
      { mtime: new Date(1980, 0, 1) },
    ];
  }
  if (!Object.keys(files).length) throw new Error(`Build ${directory} before packaging.`);
  const zipped = zipSync(files, { level: 6 });
  await Bun.write(join(root, 'build', filename!), zipped);
  console.log(`${filename}: ${zipped.byteLength.toLocaleString('en-US')} bytes`);
}
