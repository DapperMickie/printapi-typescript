import fs from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
const spec = JSON.parse(await fs.readFile(new URL('../openapi/printapi-v2.json', import.meta.url), 'utf8'));
const types = astToString(await openapiTS(spec));
const aliases = Object.keys(spec.components.schemas).map(name => `export type ${name} = components['schemas']['${name}'];`).join('\n');
const output = `// Generated from openapi/printapi-v2.json. Run npm run generate.\n${types}\n${aliases}\n`;
const path = new URL('../src/schema.ts', import.meta.url);
if (process.argv.includes('--check')) {
  if (await fs.readFile(path, 'utf8') !== output) throw new Error('Generated schema is stale. Run npm run generate.');
} else await fs.writeFile(path, output);
