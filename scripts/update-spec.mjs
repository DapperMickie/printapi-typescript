import fs from 'node:fs/promises';
const url = 'https://test.printapi.nl/v2/openapi/v2.json';
const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Specification download failed: ${response.status}`);
const spec = await response.json();
if (!spec.openapi?.startsWith('3.') || !spec.paths || !spec.components?.schemas) throw new Error('Invalid OpenAPI document');
const path = new URL('../openapi/printapi-v2.json', import.meta.url);
const canonical = value => JSON.stringify(value);
if (process.argv.includes('--check')) {
  if (canonical(JSON.parse(await fs.readFile(path, 'utf8'))) !== canonical(spec)) throw new Error('Upstream contract changed. Run npm run spec:update && npm run generate, then review changes.');
} else await fs.writeFile(path, JSON.stringify(spec, null, 2) + '\n');
