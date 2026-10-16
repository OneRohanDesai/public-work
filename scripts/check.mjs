import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import worker from '../workers/static/index.js';

const root = resolve(import.meta.dirname, '..');
for (const relative of ['index.html', 'raining-dog.gif', 'projects/index.html', 'projects/projects.json']) {
  const source = await readFile(resolve(root, 'apps/portfolio', relative));
  const output = await readFile(resolve(root, 'dist', relative));
  assert.deepEqual(output, source, `${relative} changed during build`);
}
const projects = JSON.parse(await readFile(resolve(root, 'dist/projects/projects.json'), 'utf8'));
assert.ok(Array.isArray(projects) || typeof projects === 'object');
assert.ok((await stat(resolve(root, 'dist/projects'))).isDirectory());
async function files(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await files(path));
    else if (entry.isFile()) found.push(path);
  }
  return found;
}
const sourceRoot = resolve(root, 'apps/portfolio');
const sourceFiles = (await files(sourceRoot)).map(path => relative(sourceRoot, path)).sort();
const outputFiles = (await files(resolve(root, 'dist'))).map(path => relative(resolve(root, 'dist'), path)).sort();
assert.deepEqual(outputFiles, sourceFiles, 'Portfolio file inventory changed during build');
for (const file of sourceFiles) {
  assert.deepEqual(await readFile(resolve(sourceRoot, file)), await readFile(resolve(root, 'dist', file)), file);
}
console.log(`Portfolio and project browser copied byte for byte (${sourceFiles.length} files).`);

const seen = [];
const env = { ASSETS: { async fetch(request) {
  const path = new URL(request.url).pathname;
  seen.push(path);
  if (path === '/projects/index.html') {
    return new Response(null, { status: 307, headers: { Location: '/projects/' } });
  }
  return new Response('project browser', { status: 200 });
} } };
for (const path of ['/projects/grounds', '/projects/grounds/f/LICENSE', '/projects/grounds/f/src/example.js']) {
  const response = await worker.fetch(new Request(`https://rohandesai.in${path}`, {
    headers: { Accept: 'text/html' }
  }), env);
  assert.equal(response.status, 200, path);
  assert.deepEqual(seen.slice(-2), ['/projects/index.html', '/projects/'], path);
}
assert.equal((await worker.fetch(new Request('https://rohandesai.in/projects/grounds/f/LICENSE'), env)).status, 404);
console.log('Project browser history URLs serve the existing HTML shell on direct navigation.');
