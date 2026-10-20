// Run: node data/scenarios.test.ts
import assert from 'node:assert/strict';
import { tr } from './locales/tr.ts';
import scenarios from './scenarios.json' with { type: 'json' };

// Mirror the lists in data/constants.ts (it imports without .ts extensions, so Node can't load it).
const lenses = ['8mm Fisheye', '14mm Ultra-Wide', '24mm Wide', '35mm Street', '50mm Prime', '85mm Portrait', '200mm Telephoto'];
const cameras = ['Sony A7R V', 'Canon EOS R5', 'Nikon Z9', 'Fujifilm GFX100 II', 'Leica M11', 'Arri Alexa Mini'];
const apertures = ['f/1.2', 'f/1.8', 'f/2.8', 'f/4', 'f/8', 'f/11', 'f/16'];
const ratios = ['1:1', '4:5', '5:4', '3:4', '4:3', '2:3', '3:2', '9:16', '16:9', '21:9'];

const o = tr.options;
const valid: Record<string, string[]> = {
  lighting: Object.keys(o.lights), style: Object.keys(o.styles), grading: Object.keys(o.grading),
  filmStock: Object.keys(o.films), texture: Object.keys(o.texture), scale: Object.keys(o.scales),
  pose: Object.keys(o.poses), angle: Object.keys(o.angles), lens: lenses, camera: cameras, aperture: apertures, ratio: ratios,
};

assert.ok(scenarios.length >= 30);
assert.equal(new Set(scenarios.map(s => s.text)).size, scenarios.length);
for (const { text, settings } of scenarios) {
  for (const [k, v] of Object.entries(settings)) {
    assert.ok(valid[k], `${text}: unknown key ${k}`);
    assert.ok(v !== 'Maintain Original' && valid[k].includes(v), `${text}: bad ${k} "${v}"`);
  }
}

console.log('scenario tests passed');
