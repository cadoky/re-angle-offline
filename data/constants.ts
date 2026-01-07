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

export const materialEngMapping: Record<string, string> = {
    // TR Keys
    'Eksiz Kağıt': 'Seamless Studio Paper',
    'Kadife Kumaş': 'Premium Velvet Fabric',
    'Kaba Beton': 'Rough Raw Concrete',
    'Parlatılmış Mermer': 'Polished Marble Surface',
    'Boyalı Tuğla': 'Painted Brick Wall',
    'Buzlu Cam': 'Frosted Glass Panel',
    'Derin İpek': 'Deep Silk Drape',
    'Sonsuz Fon (Infinity)': 'Infinity Cyclorama Curve',
    'Parlak Epoksi': 'High-Gloss Epoxy Floor',
    'Mat Ahşap': 'Matte Hardwood Floor',
    'Yansımalı Fayans': 'Reflective Tiled Surface',
    'Endüstriyel Beton': 'Industrial Concrete Floor',
    'Dokulu Halı': 'Textured Fabric Carpet',

    // EN Keys (Identity or Specific Mapping if needed)
    'Seamless Paper': 'Seamless Studio Paper',
    'Velvet Fabric': 'Premium Velvet Fabric',
    'Rough Concrete': 'Rough Raw Concrete',
    'Polished Marble': 'Polished Marble Surface',
    'Painted Brick': 'Painted Brick Wall',
    'Frosted Glass': 'Frosted Glass Panel',
    'Deep Silk': 'Deep Silk Drape',
    'Infinity Cyclorama': 'Infinity Cyclorama Curve',
    'Glossy Epoxy': 'High-Gloss Epoxy Floor',
    'Matte Wood': 'Matte Hardwood Floor',
    'Reflective Tiles': 'Reflective Tiled Surface',
    'Industrial Concrete': 'Industrial Concrete Floor',
    'Textured Carpet': 'Textured Fabric Carpet',
    'Infinity Cyclorama Curve': 'Infinity Cyclorama Curve' // Fallback
};

export const options = {
    angles: Object.keys(tr.options.angles),
    lenses: ['8mm Fisheye', '14mm Ultra-Wide', '24mm Wide', '35mm Street', '50mm Prime', '85mm Portrait', '200mm Telefoto'],
    scales: Object.keys(tr.options.scales),
    poses: Object.keys(tr.options.poses),
    ratios: ['1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '4:3', '3:2', '2:1', '2.39:1'],
    lights: Object.keys(tr.options.lights),
    lightsBasic: [
        'Maintain Original', 'Golden Hour', 'Neon Lights', 'Studio Light',
        'Dramatic Light', 'Hard Light', 'Shadowy Light', 'Backlight',
        'Sunset', 'Balanced Light', 'Soft Light'
    ],
    lightsAdvanced: Object.keys(tr.options.lights),
    films: Object.keys(tr.options.films),
    cameras: ['Sony A7R V', 'Canon EOS R5', 'Nikon Z9', 'Fujifilm GFX100 II', 'Leica M11', 'Arri Alexa Mini'],
    apertures: ['f/1.2', 'f/1.8', 'f/2.8', 'f/4', 'f/8', 'f/11', 'f/16'],
    styles: Object.keys(tr.options.styles),
    texture: Object.keys(tr.options.texture),
    grading: Object.keys(tr.options.grading)
};
