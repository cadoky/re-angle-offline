import type { Settings } from '../engine/buildPrompt';

// Cohesive "random idea" presets: the text and every setting fit the same picture.
export const scenarios: { text: string; settings: Partial<Settings> }[] = [
  {
    text: 'leaning against a neon-lit cyberpunk garage door, looking sneaky',
    settings: { lighting: 'Coloured Gels', style: 'Cinematic', grading: 'Teal & Orange', filmStock: 'Cinestill 800T', lens: '35mm Street', camera: 'Sony A7R V', aperture: 'f/1.2', texture: 'Soft Skin Gloss', scale: 'Medium Long Shot (Waist)', pose: 'Dynamic Movement', angle: 'Low Angle', ratio: '21:9' }
  },
  {
    text: 'rain-soaked noir detective standing under a flickering street lamp, moody atmosphere',
    settings: { lighting: 'Hard Key with Kickers', style: 'Street Photography', grading: 'Monochrome', filmStock: 'B&W High Grain', lens: '50mm Prime', camera: 'Leica M11', aperture: 'f/1.8', texture: 'Raw Skin Texture', scale: 'Medium Shot (Chest)', pose: 'Frontal Standing', angle: 'Eye Level', ratio: '4:3' }
  },
  {
    text: 'hacker sitting in a dark server room illuminated by blue LED lights, intense focus',
    settings: { lighting: 'Coloured Gels', style: 'Cinematic', grading: 'High Saturation', filmStock: 'Digital Sharp', lens: '24mm Wide', camera: 'Sony A7R V', aperture: 'f/2.8', texture: 'Matte Finish', scale: 'Close-up (Head/Shoulder)', pose: 'Sitting / Crouching', angle: 'High Angle', ratio: '16:9' }
  },
  {
    text: 'striding down a high-fashion runway, photographers flashing at the edge of the catwalk',
    settings: { lighting: 'Hard Light', style: 'Editorial', grading: 'Muted Tones', filmStock: 'Digital Sharp', lens: '200mm Telephoto', camera: 'Canon EOS R5', aperture: 'f/2.8', texture: 'Ultra-Detailed Pores', scale: 'Full Shot (Full Body)', pose: 'Dynamic Movement', angle: 'Low Angle', ratio: '2:3' }
  },
  {
    text: 'backstage before a concert, guitar in hand, haze lit by warm stage lights',
    settings: { lighting: 'Backlight', style: 'Documentary', grading: 'Warm Vintage', filmStock: 'Kodak Portra 400', lens: '35mm Street', camera: 'Nikon Z9', aperture: 'f/1.8', texture: 'Raw Skin Texture', scale: 'Medium Shot (Chest)', pose: 'Over the Shoulder', angle: 'Eye Level', ratio: '3:2' }
  },
  {
    text: 'walking through a wheat field at golden hour, wind in the hair',
    settings: { lighting: 'Golden Hour', style: 'Minimalist', grading: 'Warm Vintage', filmStock: 'Fujifilm Superia', lens: '85mm Portrait', camera: 'Fujifilm GFX100 II', aperture: 'f/1.8', texture: 'Soft Skin Gloss', scale: 'Medium Long Shot (Waist)', pose: 'Three-Quarter Turn', angle: 'Eye Level', ratio: '4:5' }
  },
];
