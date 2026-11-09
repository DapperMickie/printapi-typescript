import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const fixture = await mkdtemp(join(tmpdir(), 'printapi-package-'));
const run = (command, args, cwd = fixture) => execFileSync(command, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
try {
  const packed = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', fixture], root))[0];
  await writeFile(join(fixture, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', join(fixture, packed.filename)]);
  const common = `
const assert = (await import('node:assert/strict')).default;
const client = new sdk.PrintAPI({ accessToken: 'test', fetch: async (url, init) => {
  assert.equal(String(url), 'https://test.printapi.nl/v2/products');
  assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test');
  return new Response(JSON.stringify({ results: [] }));
}});
assert.deepEqual(await client.products.list(), { results: [] });
`;
  await writeFile(join(fixture, 'esm.mjs'), `import * as sdk from 'printapi-sdk';\n${common}`);
  await writeFile(join(fixture, 'cjs.cjs'), `const sdk = require('printapi-sdk');\n(async () => {${common}})().catch(error => {console.error(error); process.exitCode = 1;});`);
  run('node', ['esm.mjs']);
  run('node', ['cjs.cjs']);
  const types = `
import { PrintAPI, type OrderIn, type Country } from 'printapi-sdk';
const client = new PrintAPI({ accessToken: 'token' });
const country: Country = 'NL';
const order: OrderIn = { items: [] };
void client.orders.create(order);
void client.shipping.quote({ country });
void client.products.list({ includeDetails: true }).then(page => page.results[0]?.files);
// @ts-expect-error Countries are generated string unions.
const invalidCountry: Country = 'INVALID';
// @ts-expect-error Items are required.
const invalidOrder: OrderIn = {};
`;
  await writeFile(join(fixture, 'consumer.mts'), types);
  await writeFile(join(fixture, 'consumer.cts'), types);
  const tsc = resolve(root, 'node_modules/typescript/bin/tsc');
  for (const [module, resolution] of [['NodeNext', 'NodeNext'], ['ESNext', 'Bundler']]) {
    run('node', [tsc, '--noEmit', '--strict', '--skipLibCheck', 'false', '--target', 'ES2022', '--lib', 'ES2022,DOM,DOM.Iterable', '--module', module, '--moduleResolution', resolution, 'consumer.mts', ...(module === 'NodeNext' ? ['consumer.cts'] : [])]);
  }
  const manifest = JSON.parse(await readFile(join(fixture, 'node_modules/printapi-sdk/package.json'), 'utf8'));
  if (Object.keys(manifest.dependencies ?? {}).length) throw new Error('Unexpected runtime dependencies');
  console.log('Packed SDK passes ESM, CommonJS, NodeNext and bundler consumer checks.');
} catch (error) {
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  throw error;
} finally { await rm(fixture, { recursive: true, force: true }); }
