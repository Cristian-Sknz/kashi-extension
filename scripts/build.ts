import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import type { BunPlugin } from 'bun';
import pkg from '../package.json';
import manifest from '../manifest.json';

const root = resolve(import.meta.dir, '..');
export async function build(requested?: string) {
  const notices = [
    '# Third-party notices\n\nGenerated from the installed packages. Japanese dictionaries include the Kuromoji/IPADIC notice below.',
  ];
  for (const name of [
    'kuroshiro',
    'kuroshiro-analyzer-kuromoji',
    'kuromoji',
    'doublearray',
    'async',
    'lodash',
    'lodash.invert',
    'cyrillic-to-translit-js',
    'pinyin-pro',
    'es-hangul',
    'react',
    'react-dom',
    'scheduler',
  ]) {
    notices.push(`\n## ${name}\n`);
    for (const filename of [
      'LICENSE',
      'LICENSE.md',
      'LICENSE.txt',
      'LICENSE-2.0.txt',
      'NOTICE.md',
    ]) {
      const file = Bun.file(join(root, 'node_modules', name, filename));
      if (await file.exists()) notices.push(await file.text());
    }
  }
  await Bun.write(join(root, 'THIRD_PARTY_NOTICES.md'), notices.join('\n'));
  if (requested && !['web', 'desktop'].includes(requested)) throw new Error('Use web or desktop.');
  for (const target of requested ? [requested] : ['web', 'desktop']) {
    const outdir = join(root, 'dist', target === 'web' ? 'web' : 'spicetify');
    if (dirname(dirname(outdir)) !== root) throw new Error('Output must stay inside the project.');
    await rm(outdir, { recursive: true, force: true });
    await mkdir(outdir, { recursive: true });
    const plugin: BunPlugin = {
      name: 'local-kuromoji-dictionaries',
      setup(build) {
        build.onResolve({ filter: /(?:Node|Browser)DictionaryLoader(?:\.js)?$/ }, () => ({
          path: join(root, 'src/services/dictionary-loader.ts'),
        }));
        build.onResolve({ filter: /^kashi:dictionary$/ }, () => ({
          path: 'dictionary',
          namespace: 'kashi',
        }));
        build.onLoad({ filter: /.*/, namespace: 'kashi' }, async () => {
          if (target === 'web')
            return {
              loader: 'js',
              contents: `
            export async function dictionaryFile(name, path) {
              const response = await fetch(new URL(name, path.endsWith('/') ? path : path + '/'),
                { signal: AbortSignal.timeout(15000) });
              if (!response.ok) throw new Error('Could not load Japanese dictionary: ' + response.status);
              return new Uint8Array(await response.arrayBuffer());
            }`,
            };
          // ponytail: embedding costs ~24 MB of JS; avoids a server and desktop resource permissions.
          // Add a resource service only if package size becomes a real distribution constraint.
          const data: Record<string, string> = {};
          for (const name of await readdir(join(root, 'public/kuromoji/dict'))) {
            data[name] = Buffer.from(
              await Bun.file(join(root, 'public/kuromoji/dict', name)).arrayBuffer(),
            ).toString('base64');
          }
          return {
            loader: 'js',
            contents: `const data = ${JSON.stringify(data)};
            export async function dictionaryFile(name) {
              if (!Object.hasOwn(data, name)) throw new Error('Missing dictionary: ' + name);
              return Uint8Array.from(atob(data[name]), c => c.charCodeAt(0));
            }`,
          };
        });
      },
    };
    const result = await Bun.build({
      entrypoints: [join(root, target === 'web' ? 'src/index.ts' : 'src/spicetify.ts')],
      outdir,
      naming: target === 'web' ? 'content.js' : 'kashi.js',
      target: 'browser',
      format: 'iife',
      minify: true,
      plugins: [plugin],
      define: {
        'Kashi.version': JSON.stringify(pkg.version),
        'process.env.NODE_ENV': '"production"',
      },
    });
    if (!result.success) throw new AggregateError(result.logs, `Failed to build ${target}`);
    if (target === 'web') {
      await cp(join(root, 'public'), outdir, { recursive: true });
      await Bun.write(
        join(outdir, 'manifest.json'),
        JSON.stringify({ ...manifest, version: pkg.version, author: pkg.author }, null, 2),
      );
    }
    await cp(join(root, 'LICENSE'), join(outdir, 'LICENSE'));
    await cp(join(root, 'THIRD_PARTY_NOTICES.md'), join(outdir, 'THIRD_PARTY_NOTICES.md'));
    console.log(
      `${target}: ${result.outputs[0]!.size.toLocaleString('en-US')} bytes JavaScript → ${outdir}`,
    );
  }
}
if (import.meta.main) {
  const target = process.argv[2];
  await build(target);
  if (process.argv.includes('--watch')) {
    let timer: ReturnType<typeof setTimeout>;
    let pending = Promise.resolve();
    const rebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        pending = pending.then(() => build(target)).catch(console.error);
      }, 100);
    };
    for (const name of ['src', 'public', 'manifest.json', 'package.json']) {
      watch(join(root, name), { recursive: name === 'src' || name === 'public' }, rebuild);
    }
    console.log(
      'Watching source, resources and manifest. Reload the extension/page after rebuilding.',
    );
  }
}
