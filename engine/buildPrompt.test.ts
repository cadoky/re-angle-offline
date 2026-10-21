// Run: npm test
import assert from 'node:assert/strict';
import { buildPrompt, colorName, CUSTOM, customLightTag, defaultSettings, describeCustomLight, describeOrbit, getWarnings, targets } from './buildPrompt.ts';

const s = (over = {}) => ({ ...defaultSettings, ...over });

// Defaults: nothing changed, so everything is preserved and no camera geometry is written.
const base = JSON.parse(buildPrompt(s(), 'json'));
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
const j = JSON.parse(buildPrompt(busy, 'json'));
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
assert.match(describeOrbit(-45)!.text, /^45° to the subject's right .*right side/); // never "315°", readers took it as the other way round
assert.match(describeOrbit(180)!.text, /back/);

// Camera, lens and aperture are independent and read naturally.
assert.match(buildPrompt(s({ camera: 'Leica M11', lens: '85mm Portrait', aperture: 'f/1.8' }), 'text'), /Shot on a Leica M11 with an 85mm portrait lens at f\/1\.8, shallow depth of field\./);
assert.match(buildPrompt(s({ aperture: 'f/8' }), 'text'), /Shot at f\/8, deep focus\./);
assert.ok(!JSON.parse(buildPrompt(s({ aperture: 'f/8' }), 'json')).preserve.includes('camera and lens look'));

// Pose wording is natural, not "90 profile view pose".
assert.match(buildPrompt(s({ pose: '90 Profile View' }), 'text'), /turned 90° in profile/);

// Negative prompt only for SD.
assert.match(buildPrompt(s(), 'sd'), /\n\nNegative prompt: low quality/);
assert.ok(!buildPrompt(s(), 'json').includes('Negative'));
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

// Custom light plot: positions and roles become explicit sentences; an empty plot changes nothing.
const key = { x: -0.7, y: 0.7, role: 'Key', type: 'Strobe', modifier: 'Octabox', color: '#ffffff', height: 'High' };
// Plot x -0.7 is camera-left in the plot, i.e. the subject's own right.
assert.equal(describeCustomLight(key), "key light: strobe with an octabox, 45° to the subject's right, in front of them, far, above head height, angled down, white (#ffffff)");
assert.match(describeCustomLight({ ...key, x: 0.3, y: -0.6, role: 'Background', modifier: 'Bare Bulb' }), /^background light aimed at the backdrop: bare-bulb strobe, 153° to the subject's left, behind them/);
assert.equal(customLightTag({ ...key, x: 0.7, y: -0.7, role: 'Rim', color: '#00eaff' }), "cyan rim light from the subject's back-left");
const plot = JSON.parse(buildPrompt(s({ lighting: CUSTOM, customLights: [key, { ...key, x: 0.6, role: 'Fill', color: '#ff004c' }] }), 'json'));
assert.match(plot.lighting, /^custom 2-light setup, positioned relative to the subject .*: 1\) key light.*; 2\) fill light.*crimson/);
assert.ok(!plot.preserve.includes('lighting'));
assert.ok(JSON.parse(buildPrompt(s({ lighting: CUSTOM }), 'json')).preserve.includes('lighting'));
assert.match(buildPrompt(s({ lighting: CUSTOM, customLights: [key] }), 'sd'), /custom studio lighting, white key light from the subject's front-right/);
assert.match(buildPrompt(s({ lens: '35mm Street' }), 'text'), /with a 35mm lens\./);

// Each target speaks its model's dialect.
assert.match(buildPrompt(busy, 'gemini'), /^Using the provided photo of this person, re-photograph them from a new camera position: /);
const gpt = buildPrompt(s({ angleDegree: 90, lighting: CUSTOM, customLights: [key] }), 'chatgpt');
assert.match(gpt, /^Edit the uploaded photo: .*\n\nCamera:\n- camera moves around to the subject's left/);
assert.match(gpt, /\n- key light: strobe with an octabox, 45° to the subject's right/);
assert.match(gpt, /Keep exactly the same: face and identity \(it must clearly be the same person\)/);
const mj = buildPrompt(busy, 'midjourney');
assert.match(mj, /^photorealistic photo of the same person as the reference, three-quarter view, left side, low angle/);
assert.match(mj, / --oref <REFERENCE_IMAGE_URL> --ow 300 --ar 3:4 --style raw --v 7 --no low quality/);
assert.ok(!/Keep|\n/.test(mj));
assert.match(buildPrompt(busy, 'seedream'), /^Change the camera angle of the reference image: .* unchanged\.$/);

console.log('engine tests passed');

// Composition reaches every target; the negative list reaches the sentence targets as "Avoid:".
const comp = s({ composition: 'Left Third' });
for (const t of targets) assert.match(buildPrompt(comp, t), /left third/, t);
assert.match(buildPrompt(s(), 'gemini'), /Avoid: low quality/);
assert.match(buildPrompt(s(), 'chatgpt'), /Avoid: low quality/);
assert.equal(JSON.parse(buildPrompt(s({ negativePrompt: ' ' }), 'json')).avoid, undefined);
assert.ok(!buildPrompt(s({ negativePrompt: '' }), 'flux').includes('Avoid'));
