// Run: npm test
import assert from 'node:assert/strict';
import { buildPrompt, colorName, defaultSettings, describeOrbit, getWarnings, targets } from './buildPrompt.ts';

const s = (over = {}) => ({ ...defaultSettings, ...over });

// Defaults: nothing changed, so everything is preserved and no camera geometry is written.
const base = JSON.parse(buildPrompt(s(), 'gemini'));
assert.equal(base.schema, 're-angle/v2');
assert.equal(base.camera, undefined);
assert.ok(base.preserve.includes('camera and lens look'));
assert.ok(base.preserve.includes('lighting'));
assert.equal(base.lighting, undefined);
assert.equal(base.look, undefined);

// No leaks of old syntax or placeholder values into any target.
const busy = s({ angleDegree: 45, angle: 'Low Angle', scale: 'Medium Shot (Chest)', style: 'Cinematic', lighting: 'Coloured Gels', cameraSlant: '8' });
for (const t of targets) {
  const out = buildPrompt(s(), t) + buildPrompt(busy, t);
  assert.ok(!out.includes('Maintain Original'), t);
  assert.ok(!out.includes('{{'), t);
  assert.ok(!/execute narrative/i.test(out), t);
}

// Changed fields appear once; preserved list drops them.
const j = JSON.parse(buildPrompt(busy, 'gemini'));
assert.match(j.camera.orbit, /^45° .*subject's left/);
assert.equal(j.camera.roll_deg, 8);
assert.ok(!j.preserve.includes('lighting'));
assert.match(j.lighting, /crimson \(#ff004c\) from the left/);
assert.equal(JSON.stringify(j).split('3:4').length - 1, 2); // output field + prompt sentence

// Orbit is symmetric and explicit about whose side.
assert.equal(describeOrbit(null), null);
assert.match(describeOrbit(0)!.text, /head-on/);
assert.match(describeOrbit(360)!.text, /^0° /);
assert.match(describeOrbit(90)!.text, /left profile/);
assert.match(describeOrbit(270)!.text, /right profile/);
assert.match(describeOrbit(-45)!.text, /^315° .*right side/);
assert.match(describeOrbit(180)!.text, /back/);

// Camera, lens and aperture are independent and read naturally.
assert.match(buildPrompt(s({ camera: 'Leica M11', lens: '85mm Portrait', aperture: 'f/1.8' }), 'text'), /Shot on a Leica M11 with an 85mm portrait lens at f\/1\.8, shallow depth of field\./);
assert.match(buildPrompt(s({ aperture: 'f/8' }), 'text'), /Shot at f\/8, deep focus\./);
assert.ok(!JSON.parse(buildPrompt(s({ aperture: 'f/8' }), 'gemini')).preserve.includes('camera and lens look'));

// Pose wording is natural, not "90 profile view pose".
assert.match(buildPrompt(s({ pose: '90 Profile View' }), 'text'), /turned 90° in profile/);

// Negative prompt only for SD.
assert.match(buildPrompt(s(), 'sd'), /\n\nNegative prompt: low quality/);
assert.ok(!buildPrompt(s(), 'gemini').includes('Negative'));
assert.ok(!buildPrompt(s(), 'flux').includes('Negative'));

// Studio mode drops the manual scene and names colours.
const studio = buildPrompt(s({ isStudioMode: true, manualDirectives: 'on a rooftop', studioBgColor: '#000000' }), 'text');
assert.ok(!studio.includes('rooftop'));
assert.match(studio, /black \(#000000\) infinity cyclorama curve backdrop/);

assert.equal(colorName('#00eaff'), 'cyan (#00eaff)');
assert.equal(colorName('nope'), 'nope');

// Conflicts.
assert.deepEqual(getWarnings(s({ lens: '200mm Telephoto', scale: 'Wide Shot (General)' })), ['teleWide']);
assert.deepEqual(getWarnings(s({ lens: '8mm Fisheye', scale: 'Close-up (Head/Shoulder)' })), ['ultraWideClose']);
assert.deepEqual(getWarnings(s()), []);

console.log('engine tests passed');
