// Top-down light plots. Subject at (0,0) facing the camera at the bottom.
// x: -1 camera-left … 1 camera-right; y: -1 behind the subject … 1 at the camera.
export type Light = {
  x: number;
  y: number;
  kind: 'box' | 'strip' | 'umbrella' | 'spot' | 'sun' | 'reflector';
  label: string;
  size?: number;
  color?: string; // CSS colour or a token ('gelLeft' | 'gelRight' | 'gelBack') resolved by LightDiagram
  aim?: 'bg'; // points at the backdrop instead of the subject
};
// face: degrees the subject's head turns from the camera; negative = towards camera-left.
export type LightSetup = { lights: Light[]; face?: number };

const key45: Light = { x: -0.64, y: 0.64, kind: 'box', label: 'Key' };
const loopKey: Light = { x: -0.45, y: 0.78, kind: 'box', label: 'Key' };
const warm = '#fbbf24';

export const lightingSetups: Record<string, LightSetup> = {
  'Rembrandt with a Softbox': { lights: [key45] },
  'Rembrandt through a Brolly': { lights: [{ ...key45, kind: 'umbrella' }] },
  'Rembrandt with a Honeycomb': { lights: [{ ...key45, kind: 'spot', label: 'Key (grid)' }] },
  'Rembrandt with a Silver Brolly': { lights: [{ ...key45, kind: 'umbrella', label: 'Key (silver)', color: '#d4d4d8' }] },
  'Rembrandt Short': { face: -30, lights: [{ x: -0.8, y: 0.3, kind: 'box', label: 'Key' }] },
  'Rembrandt Broad': { face: -30, lights: [{ x: 0.64, y: 0.64, kind: 'box', label: 'Key' }] },
  'Split': { lights: [{ x: -1, y: 0, kind: 'box', label: 'Key' }] },
  'Split with Fill': { lights: [{ x: -1, y: 0, kind: 'box', label: 'Key' }, { x: 0.9, y: 0.25, kind: 'reflector', label: 'Fill' }] },
  'Split/Short': { face: -30, lights: [{ x: -1, y: -0.1, kind: 'box', label: 'Key' }] },
  'Split/Broad': { face: -30, lights: [{ x: 1, y: 0.1, kind: 'box', label: 'Key' }] },
  'Key with a Close Softbox': { lights: [{ x: -0.38, y: 0.38, kind: 'box', label: 'Key', size: 1.6 }] },
  'Key with a Far Away Softbox': { lights: [{ x: -0.75, y: 0.75, kind: 'box', label: 'Key', size: 0.7 }] },
  'Loop': { lights: [loopKey] },
  'Butterfly': { lights: [{ x: 0, y: 0.75, kind: 'box', label: 'Key (high)' }] },
  'Flat Light': { lights: [{ x: -0.35, y: 0.9, kind: 'box', label: 'Key' }, { x: 0.35, y: 0.9, kind: 'box', label: 'Key' }] },
  'Badger': { lights: [{ x: -0.8, y: -0.5, kind: 'strip', label: 'Strip' }, { x: 0.8, y: -0.5, kind: 'strip', label: 'Strip' }] },
  'Clamshell': { lights: [{ x: 0, y: 0.85, kind: 'box', label: 'Key (high)' }, { x: 0, y: 0.45, kind: 'reflector', label: 'Fill (low)' }] },
  'Loop with a Background Light': { lights: [loopKey, { x: 0.3, y: -0.6, kind: 'spot', label: 'BG', aim: 'bg' }] },
  'Loop with a Rim Light': { lights: [loopKey, { x: 0.7, y: -0.7, kind: 'spot', label: 'Rim' }] },
  'High Key': { lights: [{ x: 0, y: 0.8, kind: 'box', label: 'Key', size: 1.4 }, { x: -0.6, y: -0.7, kind: 'spot', label: 'BG', aim: 'bg' }, { x: 0.6, y: -0.7, kind: 'spot', label: 'BG', aim: 'bg' }] },
  'Key and Fill': { lights: [key45, { x: 0.6, y: 0.6, kind: 'box', label: 'Fill', size: 0.7 }] },
  'Key, Fill and Hair Light': { lights: [key45, { x: 0.6, y: 0.6, kind: 'box', label: 'Fill', size: 0.7 }, { x: 0.3, y: -0.75, kind: 'spot', label: 'Hair' }] },
  'Hard Key with Kickers': { lights: [{ x: -0.6, y: 0.6, kind: 'spot', label: 'Key' }, { x: -0.75, y: -0.65, kind: 'spot', label: 'Kicker' }, { x: 0.75, y: -0.65, kind: 'spot', label: 'Kicker' }] },
  'Coloured Gels': { lights: [{ x: -0.9, y: 0.1, kind: 'spot', label: 'Gel', color: 'gelLeft' }, { x: 0.9, y: 0.1, kind: 'spot', label: 'Gel', color: 'gelRight' }, { x: 0, y: -0.8, kind: 'spot', label: 'Gel', color: 'gelBack' }] },
  // Basic
  'Golden Hour': { lights: [{ x: -0.9, y: -0.3, kind: 'sun', label: 'Sun (low)', color: warm }] },
  'Neon Lights': { lights: [{ x: -0.85, y: 0.2, kind: 'strip', label: 'Neon', color: '#ec4899' }, { x: 0.85, y: 0.2, kind: 'strip', label: 'Neon', color: '#22d3ee' }] },
  'Studio Light': { lights: [{ x: -0.6, y: 0.6, kind: 'box', label: 'Key' }, { x: 0.6, y: 0.6, kind: 'box', label: 'Fill', size: 0.7 }] },
  'Dramatic Light': { lights: [{ x: -0.9, y: 0.2, kind: 'spot', label: 'Key' }] },
  'Hard Light': { lights: [{ x: -0.5, y: 0.5, kind: 'spot', label: 'Key' }] },
  'Shadowy Light': { lights: [{ x: -0.9, y: -0.1, kind: 'spot', label: 'Key (grid)', size: 0.7 }] },
  'Backlight': { lights: [{ x: 0, y: -0.85, kind: 'spot', label: 'Rim' }] },
  'Sunset': { lights: [{ x: 0.8, y: -0.6, kind: 'sun', label: 'Sun', color: '#f97316' }] },
  'Balanced Light': { lights: [{ x: -0.6, y: 0.6, kind: 'box', label: 'Key' }, { x: 0.6, y: 0.6, kind: 'box', label: 'Fill' }] },
  'Soft Light': { lights: [{ x: 0, y: 0.8, kind: 'box', label: 'Key', size: 1.8 }] },
};
