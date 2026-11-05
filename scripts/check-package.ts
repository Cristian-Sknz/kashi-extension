import { join, resolve } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import assert from 'node:assert/strict';
import pkg from '../package.json';

const root = resolve(import.meta.dir, '..');
const web = unzipSync(
  new Uint8Array(await Bun.file(join(root, 'build/Kashi-Web.zip')).arrayBuffer()),
);
const desktop = unzipSync(
  new Uint8Array(await Bun.file(join(root, 'build/Kashi-Spicetify.zip')).arrayBuffer()),
);
const manifest = JSON.parse(strFromU8(web['manifest.json']!));
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.manifest_version, 3);
assert.match(manifest.version, /^(0|[1-9]\d{0,4})(\.(0|[1-9]\d{0,4})){0,3}$/);
assert(manifest.version.split('.').every((n: string) => Number(n) <= 65535));
assert.deepEqual(manifest.permissions, ['storage']);
assert.deepEqual(manifest.content_scripts[0].matches, ['https://open.spotify.com/*']);
for (const name of [...manifest.content_scripts[0].js, ...Object.values(manifest.icons)])
  assert(web[String(name)]);
for (const [label, files, entry] of [
  ['web', web, 'content.js'],
  ['desktop', desktop, 'kashi.js'],
] as const) {
  const code = strFromU8(files[entry]!);
  assert(code.length > 0, label);
  assert(!code.includes('kashi-api.vercel.app'), label);
  assert(
    !/\b(?:require|import)\s*\(\s*['"](?:node:|fs['"]|path['"]|bun['"])/.test(code),
    `${label}: runtime dependency`,
  );
  assert(files['LICENSE'] && files['THIRD_PARTY_NOTICES.md']);
}
for await (const name of new Bun.Glob('*.gz').scan(join(root, 'public/kuromoji/dict'))) {
  const original = Buffer.from(
    await Bun.file(join(root, 'public/kuromoji/dict', name)).arrayBuffer(),
  );
  assert.deepEqual(Buffer.from(web[`kuromoji/dict/${name}`]!), original);
  assert(
    strFromU8(desktop['kashi.js']!).includes(original.toString('base64')),
    `Desktop missing ${name}`,
  );
}
console.log(
  'Both ZIPs verified: manifest, entrypoints, licenses, local dictionaries and runtime dependencies.',
);
