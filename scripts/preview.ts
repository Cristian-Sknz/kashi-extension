// Local integration harness only: synthetic Spotify markup, never user lyrics or credentials.
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dir, '..');
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 4317,
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/' || path === '/desktop') {
      const html = await Bun.file(join(root, 'tests/preview.html')).text();
      const header = await Bun.file(join(root, 'tests/fixtures/spotify-media-header.html')).text();
      return new Response(
        html
          .replace('BUNDLE_PATH', path === '/desktop' ? '/kashi.js' : '/content.js')
          .replace('<!-- MEDIA_HEADER -->', header),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }
    if (path === '/content.js') return new Response(Bun.file(join(root, 'dist/web/content.js')));
    if (path === '/kashi.js') return new Response(Bun.file(join(root, 'dist/spicetify/kashi.js')));
    if (/^\/kuromoji\/dict\/[a-z_]+\.dat(?:\.packed)?\.gz$/.test(path))
      return new Response(Bun.file(join(root, 'dist/web', path)));
    return new Response('Not found', { status: 404 });
  },
});
console.log(`Synthetic integration preview: ${server.url} (desktop: ${server.url}desktop)`);
