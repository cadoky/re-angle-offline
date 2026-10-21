import { AngleDirection } from '../types';
import { tr } from './locales/tr';
import { en } from './locales/en';

export const angleDirections: AngleDirection[] = [
    { id: 'front', label: 'Front', degree: 0, iconPos: 90 },
    { id: 'front-right', label: 'Front-Right', degree: 45, iconPos: 45 },
    { id: 'right', label: 'Right Side', degree: 90, iconPos: 0 },
    { id: 'back-right', label: 'Back-Right', degree: 135, iconPos: 315 },
    { id: 'back', label: 'Rear', degree: 180, iconPos: 270 },
    { id: 'back-left', label: 'Back-Left', degree: 225, iconPos: 225 },
    { id: 'left', label: 'Left Side', degree: 270, iconPos: 180 },
    { id: 'front-left', label: 'Front-Left', degree: 315, iconPos: 135 },
];

export const locales = { tr, en };

export const options = {
    angles: Object.keys(tr.options.angles),
    lenses: ['Maintain Original', '8mm Fisheye', '14mm Ultra-Wide', '24mm Wide', '35mm Street', '50mm Prime', '85mm Portrait', '200mm Telephoto'],
    scales: Object.keys(tr.options.scales),
    compositions: Object.keys(tr.options.compositions),
    poses: Object.keys(tr.options.poses),
    ratios: ['1:1', '4:5', '5:4', '3:4', '4:3', '2:3', '3:2', '9:16', '16:9', '21:9'],
    lights: Object.keys(tr.options.lights),
    lightsBasic: [
        'Maintain Original', 'Golden Hour', 'Neon Lights', 'Studio Light',
        'Dramatic Light', 'Hard Light', 'Shadowy Light', 'Backlight',
        'Sunset', 'Balanced Light', 'Soft Light', 'Custom Setup'
    ],
    lightsAdvanced: Object.keys(tr.options.lights),
    films: Object.keys(tr.options.films),
    cameras: ['Maintain Original', 'Sony A7R V', 'Canon EOS R5', 'Nikon Z9', 'Fujifilm GFX100 II', 'Leica M11', 'Arri Alexa Mini'],
    apertures: ['Maintain Original', 'f/1.2', 'f/1.8', 'f/2.8', 'f/4', 'f/8', 'f/11', 'f/16'],
    styles: Object.keys(tr.options.styles),
    texture: Object.keys(tr.options.texture),
    grading: Object.keys(tr.options.grading)
};
