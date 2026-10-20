import { lightingPrompts, materialEngMapping } from '../data/promptText.ts';

// Option values (keys from data/locales) are what the engine reads; 'Maintain Original' means "leave as in the reference".
export const KEEP = 'Maintain Original';

export const defaultSettings = {
  manualDirectives: '',
  angle: KEEP,
  angleDegree: 0,
  cameraSlant: '',
  lens: '85mm Portrait',
  scale: KEEP,
  pose: KEEP,
  ratio: '3:4',
  lighting: KEEP,
  filmStock: KEEP,
  camera: 'Sony A7R V',
  aperture: 'f/1.8',
  style: KEEP,
  grading: KEEP,
  texture: KEEP,
  negativePrompt: 'low quality, blurry, distorted, plastic skin, bad anatomy, deformed feet',
  isStudioMode: false,
  studioBgColor: '#ffffff',
  studioBgTexture: 'Sonsuz Fon (Infinity)',
  studioFloorColor: '#ffffff',
  studioFloorTexture: 'Sonsuz Fon (Infinity)',
  gelColorLeft: '#ff004c',
  gelColorRight: '#00eaff',
  gelColorBack: '#9d00ff',
};

export type Settings = typeof defaultSettings;
export type Target = 'gemini' | 'flux' | 'sd' | 'text';
export const targets: Target[] = ['gemini', 'flux', 'sd', 'text'];
export type Warning = 'teleWide' | 'ultraWideClose';

const elevations: Record<string, [string, string]> = {
  // [descriptive, tag]
  'Eye Level': ['eye-level camera, lens at the subject\'s eye height', 'eye level'],
  'Low Angle': ['low angle, camera below the subject\'s eye line looking up', 'low angle, from below'],
  'High Angle': ['high angle, camera above the subject looking down', 'high angle, from above'],
  "Worm's Eye": ['worm\'s-eye view, camera near the ground looking steeply up', 'worm\'s eye view'],
  "Bird's Eye": ['bird\'s-eye view, camera high above looking steeply down', 'bird\'s eye view'],
  'Overhead': ['overhead top-down shot, camera directly above the subject', 'overhead shot, top-down'],
};

const framings: Record<string, string> = {
  'Extreme Close-up (Eye/Mouth)': 'extreme close-up on the eyes and mouth',
  'Close-up (Head/Shoulder)': 'close-up, head and shoulders',
  'Medium Shot (Chest)': 'medium shot, chest up',
  'Medium Long Shot (Waist)': 'medium long shot, waist up',
  'Full Shot (Full Body)': 'full shot, head to toe',
  'Wide Shot (General)': 'wide shot, full body with the surroundings visible',
  'Extreme Wide Shot': 'extreme wide shot, the subject small in a large environment',
  'Long Distance': 'long-distance shot, the subject a tiny figure in a vast landscape',
};

const poses: Record<string, string> = {
  'Frontal Standing': 'standing upright, body facing the camera',
  '90 Profile View': 'standing with the body turned 90° in profile',
  'Three-Quarter Turn': 'body turned three-quarters away from the camera',
  'Sitting / Crouching': 'sitting or crouching',
  'Dynamic Movement': 'caught mid-movement in a dynamic pose',
  'Over the Shoulder': 'looking back over the shoulder towards the camera',
};

const skins: Record<string, string> = {
  'Ultra-Detailed Pores': 'ultra-detailed skin with visible pores',
  'Soft Skin Gloss': 'soft, slightly glossy skin',
  'Raw Skin Texture': 'raw, unretouched skin texture',
  'Matte Finish': 'matte skin finish',
};

// Orbit: 0° = reference front view, positive = camera walks to the photographer's right (the subject's left).
export function describeOrbit(deg: number): { text: string; tag: string } | null {
  const d = ((Math.round(deg) % 360) + 360) % 360;
  if (d === 0) return null;
  const delta = d <= 180 ? d : 360 - d;
  const side = d < 180 ? 'left' : 'right';
  if (delta === 180) return { text: '180° — camera moves directly behind the subject, showing their back', tag: 'from behind, back view' };
  const [view, tag] =
    delta <= 30 ? [`a slightly angled view favouring their ${side} side`, 'slightly angled view'] :
    delta <= 67 ? [`a three-quarter view of their ${side} side`, `three-quarter view, ${side} side`] :
    delta <= 112 ? [`their ${side} profile`, `profile view, from ${side} side`] :
    [`a rear three-quarter view from their ${side} side`, `from behind, rear three-quarter view, ${side} side`];
  return { text: `${d}° — camera moves around to the subject's ${side}, showing ${view}`, tag };
}

const namedColors: [string, number, number, number][] = [
  ['white', 255, 255, 255], ['light grey', 200, 200, 200], ['grey', 128, 128, 128], ['charcoal', 54, 54, 54], ['black', 0, 0, 0],
  ['red', 230, 20, 20], ['crimson', 220, 20, 60], ['orange', 255, 140, 0], ['amber', 255, 191, 0], ['yellow', 255, 235, 0],
  ['lime green', 150, 255, 0], ['green', 20, 170, 40], ['teal', 0, 128, 128], ['cyan', 0, 230, 255], ['sky blue', 100, 180, 255],
  ['blue', 20, 60, 255], ['navy', 10, 20, 100], ['violet', 143, 0, 255], ['purple', 110, 30, 150], ['magenta', 255, 0, 200],
  ['pink', 255, 120, 180], ['beige', 225, 205, 170], ['brown', 120, 70, 30],
];

// Models read colour names better than hex; the hex stays in brackets for precision.
export function colorName(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  const [name] = namedColors.reduce((best, c) => {
    const dist = (c[1] - r) ** 2 + (c[2] - g) ** 2 + (c[3] - b) ** 2;
    return dist < best[1] ? [c[0], dist] as [string, number] : best;
  }, ['', Infinity] as [string, number]);
  return `${name} (#${m[1].toLowerCase()})`;
}

const focal = (lens: string) => parseInt(lens, 10) || 0;
const fNumber = (aperture: string) => parseFloat(aperture.replace('f/', '')) || 0;

function depthOfField(aperture: string) {
  const f = fNumber(aperture);
  return f <= 2 ? 'shallow depth of field' : f <= 4 ? 'moderate depth of field' : 'deep focus';
}

export function getWarnings(s: Settings): Warning[] {
  const w: Warning[] = [];
  if (focal(s.lens) >= 135 && ['Wide Shot (General)', 'Extreme Wide Shot', 'Long Distance'].includes(s.scale)) w.push('teleWide');
  if (focal(s.lens) <= 14 && ['Extreme Close-up (Eye/Mouth)', 'Close-up (Head/Shoulder)'].includes(s.scale)) w.push('ultraWideClose');
  return w;
}

const set = (v: string) => v && v !== KEEP;
const joinList = (items: string[]) => items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// Everything a target needs, resolved once from settings. Undefined = not changed.
function resolve(s: Settings) {
  const studio = s.isStudioMode;
  const scene = studio ? '' : s.manualDirectives.trim();
  const roll = parseFloat(s.cameraSlant) || 0;

  let lighting = set(s.lighting) ? (lightingPrompts[s.lighting] || s.lighting) : undefined;
  if (s.lighting === 'Coloured Gels') {
    const gels = [['left', s.gelColorLeft], ['right', s.gelColorRight], ['behind the subject', s.gelColorBack]]
      .filter(([, c]) => c).map(([where, c]) => `${colorName(c)} ${where === 'behind the subject' ? where : `from the ${where}`}`);
    if (gels.length) lighting += `: ${joinList(gels)}`;
  }

  const look = {
    style: set(s.style) ? `${s.style.toLowerCase()} style` : undefined,
    grading: set(s.grading) ? `${s.grading} color grading` : undefined,
    film: set(s.filmStock) ? `${s.filmStock} film look` : undefined,
    skin: set(s.texture) ? (skins[s.texture] || s.texture) : undefined,
  };

  const preserve = ['face and identity', 'hairstyle', 'outfit', 'accessories'];
  if (!set(s.pose)) preserve.push('pose');
  if (!studio) {
    if (!lighting) preserve.push('lighting');
    if (!look.grading) preserve.push('color grading');
    if (!look.style) preserve.push('visual style');
    if (!look.skin) preserve.push('skin texture');
    if (!look.film) preserve.push('film look');
    if (!scene) preserve.push('background and setting');
  }

  return {
    orbit: describeOrbit(s.angleDegree),
    elevation: elevations[s.angle],
    framing: framings[s.scale],
    pose: poses[s.pose],
    roll,
    scene,
    studio: studio ? {
      background: `${colorName(s.studioBgColor)} ${(materialEngMapping[s.studioBgTexture] || s.studioBgTexture).toLowerCase()}`,
      floor: `${colorName(s.studioFloorColor)} ${(materialEngMapping[s.studioFloorTexture] || s.studioFloorTexture).toLowerCase()}`,
    } : undefined,
    lens: `${s.lens.toLowerCase()} lens, ${s.aperture}, ${depthOfField(s.aperture)}`,
    body: s.camera,
    lighting,
    look,
    preserve,
    ratio: s.ratio,
  };
}

type Resolved = ReturnType<typeof resolve>;

function narrative(r: Resolved, flux: boolean): string {
  const view = [r.orbit && r.orbit.text.split(' — ')[1], r.elevation?.[0], r.framing].filter(Boolean) as string[];
  const out: string[] = [];
  const opener = flux ? 'Change the camera viewpoint of this photo' : 'Re-photograph the same person from a new camera position';
  out.push(view.length ? `${opener}: ${view.join('; ')}.` : `${flux ? 'Edit this photo' : 'Re-photograph the same person'}.`);
  if (r.roll) out.push(`Tilt the camera ${Math.abs(r.roll)}° for a Dutch angle.`);
  if (r.pose) out.push(`The person is ${r.pose}.`);
  if (r.scene) out.push(`Scene: ${r.scene}.`);
  if (r.studio) out.push(`Place them in a professional photo studio with a ${r.studio.background} backdrop and a ${r.studio.floor} floor.`);
  const lens = `${/^(8|11|18)/.test(r.lens) ? 'an' : 'a'} ${r.lens}`;
  out.push(flux ? `Use the look of ${lens}.` : `Shot on a ${r.body} with ${lens}.`);
  if (r.lighting) out.push(`Lighting: ${r.lighting}.`);
  const look = Object.values(r.look).filter(Boolean) as string[];
  if (look.length) out.push(`Look: ${look.join(', ')}.`);
  out.push(`Keep the ${joinList(r.preserve)} exactly the same as in the reference.`);
  if (!flux) out.push(`Aspect ratio ${r.ratio}.`);
  return out.join(' ');
}

function tags(r: Resolved, s: Settings): string {
  const t = [
    'photorealistic photo', 'same person as reference',
    r.orbit?.tag, r.elevation?.[1], r.framing, r.roll ? 'dutch angle' : undefined, r.pose,
    r.scene || undefined,
    r.studio && `studio, ${r.studio.background} backdrop, ${r.studio.floor} floor`,
    `shot on ${r.body}`, r.lens,
    set(s.lighting) ? `${s.lighting.toLowerCase()} lighting` : undefined,
    ...Object.values(r.look),
  ].filter(Boolean);
  return `${t.join(', ')}\n\nNegative prompt: ${s.negativePrompt.trim()}`;
}

function json(r: Resolved): string {
  const camera = {
    orbit: r.orbit?.text,
    elevation: r.elevation?.[0],
    roll_deg: r.roll || undefined,
    framing: r.framing,
    lens: r.lens,
    body: r.body,
  };
  const look = Object.values(r.look).some(Boolean) ? r.look : undefined;
  // JSON.stringify drops undefined fields, so only changed values appear.
  return JSON.stringify({
    schema: 're-angle/v2',
    task: 're-angle the reference photo',
    preserve: r.preserve,
    camera,
    pose: r.pose,
    scene: r.scene || undefined,
    studio: r.studio,
    lighting: r.lighting,
    look,
    output: { aspect_ratio: r.ratio },
    prompt: narrative(r, false),
  }, null, 2);
}

export function buildPrompt(s: Settings, target: Target): string {
  const r = resolve(s);
  if (target === 'gemini') return json(r);
  if (target === 'sd') return tags(r, s);
  return narrative(r, target === 'flux');
}
