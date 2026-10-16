import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';

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
