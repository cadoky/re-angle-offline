// Run: node data/lightingSetups.test.ts
import assert from 'node:assert/strict';
import { tr } from './locales/tr.ts';
import { lightingSetups } from './lightingSetups.ts';

for (const key of Object.keys(tr.options.lights)) {
  if (key === 'Maintain Original') continue;
  assert.ok(lightingSetups[key]?.lights.length, `missing lighting setup: ${key}`);
}
for (const [key, s] of Object.entries(lightingSetups)) {
  assert.ok(key in tr.options.lights, `unknown lighting key: ${key}`);
  for (const l of s.lights) assert.ok(Math.abs(l.x) <= 1 && Math.abs(l.y) <= 1, key);
}

console.log('lighting setup tests passed');
