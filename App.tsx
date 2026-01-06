import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Layout,
  Maximize2,
  Move,
  Zap,
  Film,
  Sun,
  HardDrive,
  Check,
  Sparkles,
  Play,
  User,
  ChevronDown,
  Gauge,
  PersonStanding,
  Compass,
  Telescope,
  RotateCw,
  Code,
  Instagram,
  EyeOff,
  Palette,
  Fingerprint,
  ClipboardCopy,
  Box,
  Pipette,
  Layers,
  Mountain
} from 'lucide-react';

// --- TYPES ---

interface AngleDirection {
  id: string;
  label: string;
  degree: number;
  iconPos: number;
}

interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string | number | undefined;
  options: string[];
  translations?: Record<string, string>;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  onChange: (v: any) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

interface SelectorProps {
  label?: string;
  icon: React.ReactNode;
  value: string | number | undefined;
  options: string[] | undefined;
  onChange: (v: any) => void;
  translations?: Record<string, string>;
  disabled?: boolean;
  colorPicker?: {
    val: string;
    set: (v: string) => void;
  } | null;
}

// --- GLOBAL METADATA ---
const angleDirections: AngleDirection[] = [
  { id: 'front', label: 'Front', degree: 0, iconPos: 90 },
  { id: 'front-right', label: 'Front-Right', degree: 45, iconPos: 45 },
  { id: 'right', label: 'Right Side', degree: 90, iconPos: 0 },
  { id: 'back-right', label: 'Back-Right', degree: 135, iconPos: 315 },
  { id: 'back', label: 'Rear', degree: 180, iconPos: 270 },
  { id: 'back-left', label: 'Back-Left', degree: 225, iconPos: 225 },
  { id: 'left', label: 'Left Side', degree: 270, iconPos: 180 },
  { id: 'front-left', label: 'Front-Left', degree: 315, iconPos: 135 },
];

const translations: Record<string, Record<string, string> | string[]> = {
  angles: { 'Maintain Original': 'Değiştirme', 'Eye Level': 'Göz Hizası', 'Low Angle': 'Düşük Açı', 'High Angle': 'Yüksek Açı', 'Worm\'s Eye': 'Kurbağa Bakışı', 'Bird\'s Eye': 'Kuş Bakışı', 'Overhead': 'Üst Açı' },
  scales: { 'Maintain Original': 'Değiştirme', 'Extreme Close-up (Eye/Mouth)': 'Çok yakın plan', 'Close-up (Head/Shoulder)': 'Yakın plan', 'Medium Shot (Chest)': 'Göğüs plan', 'Medium Long Shot (Waist)': 'Bel plan', 'Full Shot (Full Body)': 'Boy plan', 'Wide Shot (General)': 'Genel plan', 'Extreme Wide Shot': 'Çok genel plan', 'Long Distance': 'Uzak mesafe' },
  poses: { 'Maintain Original': 'Değiştirme', 'Frontal Standing': 'Düz Duruş', '90 Profile View': 'Profil Duruş', 'Three-Quarter Turn': 'Üç Çeyrek Duruş', 'Sitting / Crouching': 'Oturur / Çömelmiş', 'Dynamic Movement': 'Dinamik / Hareketli', 'Over the Shoulder': 'Omuz Üstü Bakış' },
  lights: { 'Maintain Original': 'Değiştirme', 'Butterfly Lighting': 'Butterfly Aydınlatma', 'Rim Lighting': 'Rim Light (Kontur)', 'Rembrandt Lighting': 'Rembrandt', 'Softbox Studio': 'Yumuşak Stüdyo', 'Gobo Shadows': 'Gobo Gölgeleri', 'Neon / Cyberpunk': 'Neon Işıklar', 'Golden Hour': 'Altın Saat' },
  styles: { 'Maintain Original': 'Değiştirme', 'Editorial': 'Editöryal', 'Cinematic': 'Sinematik', 'Belgesel': 'Belgesel', 'Sokak Fotoğrafçılığı': 'Sokak Fotoğrafçılığı', 'Minimalist': 'Minimalist', 'Avant-garde': 'Avangart' },
  films: { 'Maintain Original': 'Değiştirme', 'Kodak Portra 400': 'Kodak Portra 400', 'Fujifilm Superia': 'Fujifilm Superia', 'B&W High Grain': 'Siyah Beyaz (Yüksek Gren)', 'Cinestill 800T': 'Cinestill 800T', 'Digital Sharp': 'Dijital Keskin' },
  texture: { 'Maintain Original': 'Değiştirme', 'Ultra-Detailed Pores': 'Gözenek Detaylı', 'Soft Skin Gloss': 'Yumuşak Cilt Parlaması', 'Raw Skin Texture': 'Ham Cilt Dokusu', 'Matte Finish': 'Mat Görünüm' },
  grading: { 'Maintain Original': 'Değiştirme', 'Teal & Orange': 'Teal & Orange', 'Warm Vintage': 'Sıcak Nostalji', 'Muted Tones': 'Soluk Tonlar', 'High Saturation': 'Yüksek Doygunluk', 'Monochrome': 'Siyah Beyaz' },
  studioTextures: ['Eksiz Kağıt', 'Kadife Kumaş', 'Kaba Beton', 'Parlatılmış Mermer', 'Boyalı Tuğla', 'Buzlu Cam', 'Derin İpek', 'Sonsuz Fon (Infinity)'],
  floorTextures: ['Parlak Epoksi', 'Mat Ahşap', 'Yansımalı Fayans', 'Endüstriyel Beton', 'Dokulu Halı', 'Sonsuz Fon (Infinity)']
};

const materialEngMapping: Record<string, string> = {
  'Eksiz Kağıt': 'seamless paper',
  'Kadife Kumaş': 'velvet fabric',
  'Kaba Beton': 'rough concrete',
  'Parlatılmış Mermer': 'polished marble',
  'Boyalı Tuğla': 'painted brick',
  'Buzlu Cam': 'frosted glass',
  'Derin İpek': 'deep silk',
  'Sonsuz Fon (Infinity)': 'pure infinity curve seamless studio',
  'Parlak Epoksi': 'high-gloss epoxy',
  'Mat Ahşap': 'matte hardwood',
  'Yansımalı Fayans': 'reflective tiled',
  'Endüstriyel Beton': 'industrial concrete',
  'Dokulu Halı': 'textured carpet'
};

const options = {
  angles: Object.keys(translations.angles),
  lenses: ['8mm Fisheye', '14mm Ultra-Wide', '24mm Wide', '35mm Street', '50mm Prime', '85mm Portrait', '200mm Telefoto'],
  scales: Object.keys(translations.scales),
  poses: Object.keys(translations.poses),
  ratios: ['1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '4:3', '3:2', '2:1', '2.39:1'],
  lights: Object.keys(translations.lights),
  films: Object.keys(translations.films),
  cameras: ['Sony A7R V', 'Canon EOS R5', 'Nikon Z9', 'Fujifilm GFX100 II', 'Leica M11', 'Arri Alexa Mini'],
  apertures: ['f/1.2', 'f/1.8', 'f/2.8', 'f/4', 'f/8', 'f/11', 'f/16'],
  styles: Object.keys(translations.styles),
  texture: Object.keys(translations.texture),
  grading: Object.keys(translations.grading)
};

const safeString = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') return val;
  return String(val);
};

const MinimalistLogo: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 2L16 16L28 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 16L9 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// --- COMPONENT: SelectorComponent ---
const SelectorComponent: React.FC<SelectorProps> = ({ label, icon, value, options: menuOptions, onChange, translations: menuTranslations, disabled = false, colorPicker = null }) => {
  const [isOpen, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const selRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selRef.current) {
      const rect = selRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 320); // 320px threshold for menu
    } else {
      setOpenUpwards(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const out = (e: MouseEvent) => {
      if (selRef.current && !selRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  return (
    <div className="dropdown-container w-full relative" ref={selRef} style={{ zIndex: isOpen ? 50 : undefined }}>
      {label && <label className={`text-[8px] font-black uppercase tracking-widest px-1 flex items-center gap-2 mb-1.5 font-bold ${disabled ? 'text-zinc-700' : 'text-white'}`}>{label}</label>}
      <div className={`w-full flex items-center gap-2 text-[10px] font-black glass-input px-3 py-2.5 rounded-xl border border-white/10 hover:border-pink-500/40 shadow-sm transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <span className={`opacity-50 ${disabled ? 'text-zinc-700' : 'text-pink-500'}`}>{icon}</span>

        <button disabled={disabled} onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }} className="flex-1 text-left truncate uppercase text-white font-bold outline-none flex items-center justify-between">
          <span className="ml-1">{menuTranslations ? menuTranslations[safeString(value)] : safeString(value)}</span>
          {!disabled && <ChevronDown size={10} className={`text-pink-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
        </button>

        {colorPicker && !disabled && (
          <div className="color-dot ml-2 shadow-lg" style={{ backgroundColor: colorPicker.val }}>
            <input type="color" value={colorPicker.val} onChange={(e) => colorPicker.set(e.target.value)} />
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div className={`dropdown-menu rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-[0_20px_50px_rgba(0,0,0,1)] w-full ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {menuOptions?.map((opt) => (
            <button key={opt} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }} className="dropdown-item w-full text-left font-bold">{menuTranslations ? menuTranslations[opt] : opt}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: DropdownComponent ---
const DropdownComponent: React.FC<DropdownProps> = ({ label, icon, value, options: menuOptions, translations: menuTranslations, isOpen, setOpen, onChange, menuRef }) => {
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 320);
    } else {
      setOpenUpwards(false);
    }
  }, [isOpen]);

  return (
    <div className="dropdown-container w-full relative" ref={menuRef} style={{ zIndex: isOpen ? 50 : undefined }}>
      <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block tracking-widest px-1 text-white font-bold">{label}</span>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }} className="w-full flex items-center gap-3 text-[11px] font-black border border-white/10 px-4 py-3 rounded-xl bg-black/40 hover:border-pink-500/40 shadow-lg justify-between transition-all cursor-pointer">
        <div className="flex items-center gap-2 text-pink-500">{icon} <span className="text-white truncate max-w-[120px] uppercase font-bold">{safeString(value)}</span></div>
        <ChevronDown size={14} className={`text-pink-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`dropdown-menu rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-[0_20px_50px_rgba(0,0,0,1)] w-full ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {menuOptions?.map((opt) => (
            <button key={opt} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }} className="dropdown-item w-full text-left">{menuTranslations ? menuTranslations[opt] : opt}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const angleMenuRef = useRef<HTMLDivElement>(null);
  const scaleMenuRef = useRef<HTMLDivElement>(null);
  const poseMenuRef = useRef<HTMLDivElement>(null);
  const lastScenarioIndex = useRef<number>(-1);

  // --- BASIC STATE ---
  const [manualDirectives, setManualDirectives] = useState('');
  const [angle, setAngle] = useState('Maintain Original');
  const [angleDegree, setAngleDegree] = useState(0);
  const [cameraSlant, setCameraSlant] = useState('');
  const [selectedAngleId, setSelectedAngleId] = useState('front');
  const [lens, setLens] = useState('85mm Portrait');
  const [scale, setScale] = useState('Maintain Original');
  const [pose, setPose] = useState('Maintain Original');
  const [ratio, setRatio] = useState('3:4');
  const [lighting, setLighting] = useState('Maintain Original');
  const [filmStock, setFilmStock] = useState('Maintain Original');
  const [camera, setCamera] = useState('Sony A7R V');
  const [aperture, setAperture] = useState('f/1.8');
  const [style, setStyle] = useState('Maintain Original');
  const [grading, setGrading] = useState('Maintain Original');
  const [texture, setTexture] = useState('Maintain Original');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted, plastic skin, bad anatomy, deformed feet');

  // --- STUDIO MODE STATE (Infinity defaults applied here) ---
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [studioBgColor, setStudioBgColor] = useState('#ffffff');
  const [studioBgTexture, setStudioBgTexture] = useState('Sonsuz Fon (Infinity)'); // Default set to Infinity
  const [studioFloorColor, setStudioFloorColor] = useState('#ffffff');
  const [studioFloorTexture, setStudioFloorTexture] = useState('Sonsuz Fon (Infinity)'); // Default set to Infinity

  // UI States
  const [isAngleMenuOpen, setIsAngleMenuOpen] = useState(false);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('');

  const getDirectionLabel = (deg: number): string => {
    const closest = angleDirections.reduce((prev, curr) => (Math.abs(curr.degree - deg) < Math.abs(prev.degree - deg) ? curr : prev));
    return closest.label;
  };

  // --- INFINITY SYNC LOGIC ---
  const handleBgTextureChange = (val: string) => {
    setStudioBgTexture(val);
    if (val === 'Sonsuz Fon (Infinity)') {
      setStudioFloorTexture('Sonsuz Fon (Infinity)');
    }
  };

  const handleFloorTextureChange = (val: string) => {
    setStudioFloorTexture(val);
    if (val === 'Sonsuz Fon (Infinity)') {
      setStudioBgTexture('Sonsuz Fon (Infinity)');
    }
  };

  useEffect(() => {
    const examples = [
      "he/she/they striding confidently down a high-fashion runway with sharp editorial lighting",
      "he/she/they leaning against a neon-lit cyberpunk garage door, looking sneaky",
      "he/she/they walking through a heavy urban fog, wearing a long leather trench coat",
      "sitting on a vintage leather sofa, he/she/they looking into the camera lens"
    ];
    setDynamicPlaceholder(`İsteğe bağlı prompt (Sadece İngilizce). Örn: ${examples[Math.floor(Math.random() * examples.length)]}`);
  }, []);

  // --- PROMPT ENGINE ---
  const buildFinalPromptJSON = () => {
    const directionLabel = getDirectionLabel(angleDegree);
    const scaleProtocol: Record<string, string> = {
      'Full Shot (Full Body)': "head-to-toe full body frame",
      'Wide Shot (General)': "24mm wide perspective",
      'Extreme Wide Shot': "extreme wide subject smaller",
      'Long Distance': "tiny focal point epic landscape",
      'default': "technical framing"
    };

    const narrativeText = isStudioMode ? "" : manualDirectives.trim();
    const bgTextureEng = materialEngMapping[studioBgTexture] || 'seamless';
    const floorTextureEng = materialEngMapping[studioFloorTexture] || 'studio floor';

    const baseMaintained = ['model', 'clothes', 'accessories', 'consistency'];
    const dynamicMaintained = [
      (!isStudioMode && lighting === 'Maintain Original') ? 'lighting' : null,
      (!isStudioMode && grading === 'Maintain Original') ? 'grading' : null,
      (!isStudioMode && style === 'Maintain Original') ? 'visual style' : null,
      (!isStudioMode && texture === 'Maintain Original') ? 'skin texture' : null,
      (!isStudioMode && filmStock === 'Maintain Original') ? 'film stock' : null,
    ].filter(Boolean);

    const fullMaintainedList = [...dynamicMaintained, ...baseMaintained].join(", ");

    const finalPromptArr = [
      "{{best quality, amazing aesthetics}}",
      isStudioMode ? `{{professional photography studio, seamless ${studioBgColor} ${bgTextureEng} background}}` : null,
      isStudioMode ? `{{subject standing on ${studioFloorColor} ${floorTextureEng} floor, clean minimalist environment}}` : null,
      `{{shot on ${camera}}}`,
      `{${lens}}`,
      `{${aperture}}`,
      narrativeText ? `{{${narrativeText}}}` : "",
      angle !== 'Maintain Original' ? `{${angle}}` : null,
      scale !== 'Maintain Original' ? `{${scaleProtocol[scale] || safeString(scale)}}` : null,
      pose !== 'Maintain Original' ? `{${pose.toLowerCase()} pose}` : null,

      // Ensure lighting, style, etc. are correctly included in final technical string
      lighting !== 'Maintain Original' ? `{lighting: ${lighting}}` : null,
      style !== 'Maintain Original' ? `{style: ${style}}` : null,
      grading !== 'Maintain Original' ? `{grading: ${grading}}` : null,
      texture !== 'Maintain Original' ? `{texture: ${texture}}` : null,
      filmStock !== 'Maintain Original' ? `{film stock: ${filmStock}}` : null,

      `{match ref: ${fullMaintainedList}}`,
      `Aspect Ratio ${ratio}`
    ].filter(v => v !== null && v !== "");

    return JSON.stringify({
      camera_override_protocol: `MANDATORY: shot on {${camera}}. ${isStudioMode ? `FORCE BACKGROUND: ${studioBgColor} ${bgTextureEng}. FORCE FLOOR: ${studioFloorColor} ${floorTextureEng}.` : ''} Execute narrative {${narrativeText}}. Technical parameters locked.`,
      volumetric_reconstruction: "Maintain realism and standard proportions. Identity mapping active.",
      selected_parameters: {
        studio_mode: isStudioMode ? "ACTIVE" : "Inactive",
        background: isStudioMode ? `${studioBgColor} (${studioBgTexture})` : "Reference Default",
        floor: isStudioMode ? `${studioFloorColor} (${studioFloorTexture})` : "Reference Default",
        camera, lens, aperture,
        angle, scale, pose,
        orbital_degree: `${angleDegree}° (${directionLabel})`,
        dutch_roll: `${cameraSlant || '0'}°`,
        aspect_ratio: ratio,
        lighting, style, grading, texture, filmStock
      },
      consistency_anchors: {
        model: "identity lock",
        garments: "garment sync",
        accessories: "accessory lock",
        maintained_features: fullMaintainedList
      },
      framing_boundaries: `{${scale !== 'Maintain Original' ? scale : 'Maintain Original'}} at {${ratio}} aspect.`,
      optical_physics: `Utilizing {${camera}} @ {${aperture}}. Roll {${cameraSlant || '0'}°}. Lens {${lens}}.`,
      negative_prompt: negativePrompt,
      final_technical_prompt: finalPromptArr.join(", ")
    }, null, 2);
  };

  useEffect(() => {
    setGeneratedPrompt(buildFinalPromptJSON());
  }, [manualDirectives, angle, angleDegree, cameraSlant, lens, scale, pose, lighting, filmStock, camera, aperture, ratio, style, grading, texture, negativePrompt, isStudioMode, studioBgColor, studioBgTexture, studioFloorColor, studioFloorTexture]);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = generatedPrompt;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const enhanceDirectives = () => {
    if (isStudioMode) return;

    // Helper to get random angle direction
    const getRandomAngleDir = () => angleDirections[Math.floor(Math.random() * angleDirections.length)];

    // Cohesive Scenarios ensuring all settings match the narrative idea
    const scenarios = [
      // --- CYBERPUNK / NEON / NIGHT ---
      {
        text: "leaning against a neon-lit cyberpunk garage door, looking sneaky",
        settings: {
          lighting: 'Neon / Cyberpunk',
          style: 'Cinematic',
          grading: 'Teal & Orange',
          filmStock: 'Cinestill 800T',
          lens: '35mm Street',
          camera: 'Sony A7R V',
          aperture: 'f/1.2',
          texture: 'Soft Skin Gloss',
          scale: 'Medium Long Shot (Waist)',
          pose: 'Sitting / Crouching',
          angle: 'Low Angle',
          ratio: '2.39:1'
        }
      },
      {
        text: "rain-soaked noir detective standing under a flickering street lamp, moody atmosphere",
        settings: {
          lighting: 'Rembrandt Lighting',
          style: 'Sokak Fotoğrafçılığı',
          grading: 'Monochrome',
          filmStock: 'B&W High Grain',
          lens: '50mm Prime',
          camera: 'Leica M11',
          aperture: 'f/1.8',
          texture: 'Raw Skin Texture',
          scale: 'Medium Shot (Chest)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '4:3'
        }
      },
      {
        text: "hacker sitting in a dark server room illuminated by blue LED lights, intense focus",
        settings: {
          lighting: 'Neon / Cyberpunk',
          style: 'Cinematic',
          grading: 'High Saturation',
          filmStock: 'Digital Sharp',
          lens: '24mm Wide',
          camera: 'Sony A7R V',
          aperture: 'f/2.8',
          texture: 'Matte Finish',
          scale: 'Close-up (Head/Shoulder)',
          pose: 'Sitting / Crouching',
          angle: 'High Angle',
          ratio: '16:9'
        }
      },

      // --- EDITORIAL / HIGH FASHION ---
      {
        text: "striding confidently down a high-fashion runway with sharp editorial lighting",
        settings: {
          lighting: 'Butterfly Lighting',
          style: 'Editorial',
          grading: 'High Saturation',
          filmStock: 'Digital Sharp',
          lens: '85mm Portrait',
          camera: 'Fujifilm GFX100 II',
          aperture: 'f/8',
          texture: 'Ultra-Detailed Pores',
          scale: 'Full Shot (Full Body)',
          pose: 'Frontal Standing',
          angle: 'Low Angle',
          ratio: '4:5'
        }
      },
      {
        text: "high-fashion pose in a minimalist white studio, wearing avant-garde geometric clothing",
        settings: {
          lighting: 'Softbox Studio',
          style: 'Avant-garde',
          grading: 'Muted Tones',
          filmStock: 'Digital Sharp',
          lens: '50mm Prime',
          camera: 'Fujifilm GFX100 II',
          aperture: 'f/11',
          texture: 'Matte Finish',
          scale: 'Medium Long Shot (Waist)',
          pose: 'Dynamic Movement',
          angle: 'Low Angle',
          ratio: '2:3'
        }
      },
      {
        text: "close-up beauty shot with glossy makeup, direct flash photography style",
        settings: {
          lighting: 'Butterfly Lighting',
          style: 'Editorial',
          grading: 'High Saturation',
          filmStock: 'Fujifilm Superia',
          lens: '85mm Portrait',
          camera: 'Canon EOS R5',
          aperture: 'f/5.6',
          texture: 'Soft Skin Gloss',
          scale: 'Extreme Close-up (Eye/Mouth)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '4:5'
        }
      },

      // --- STREET / URBAN / DOCUMENTARY ---
      {
        text: "walking through a heavy urban fog, wearing a long leather trench coat",
        settings: {
          lighting: 'Rim Lighting',
          style: 'Sokak Fotoğrafçılığı',
          grading: 'Muted Tones',
          filmStock: 'B&W High Grain',
          lens: '50mm Prime',
          camera: 'Leica M11',
          aperture: 'f/2.8',
          texture: 'Raw Skin Texture',
          scale: 'Medium Shot (Chest)',
          pose: 'Dynamic Movement',
          angle: 'Eye Level',
          ratio: '3:2'
        }
      },
      {
        text: "sitting on a skateboard in a gritty alleyway, fisheye lens distortion, 90s vibe",
        settings: {
          lighting: 'Golden Hour',
          style: 'Sokak Fotoğrafçılığı',
          grading: 'Warm Vintage',
          filmStock: 'Fujifilm Superia',
          lens: '8mm Fisheye',
          camera: 'Canon EOS R5',
          aperture: 'f/4',
          texture: 'Raw Skin Texture',
          scale: 'Full Shot (Full Body)',
          pose: 'Sitting / Crouching',
          angle: 'Low Angle',
          ratio: '4:3'
        }
      },
      {
        text: "candid shot laughing at a cafe table, sunlight streaming through window",
        settings: {
          lighting: 'Golden Hour',
          style: 'Belgesel',
          grading: 'Warm Vintage',
          filmStock: 'Kodak Portra 400',
          lens: '35mm Street',
          camera: 'Leica M11',
          aperture: 'f/2.8',
          texture: 'Raw Skin Texture',
          scale: 'Medium Shot (Chest)',
          pose: 'Sitting / Crouching',
          angle: 'Eye Level',
          ratio: '3:2'
        }
      },
      {
        text: "standing in a busy subway station with motion blur around, isolated subject",
        settings: {
          lighting: 'Softbox Studio',
          style: 'Cinematic',
          grading: 'Teal & Orange',
          filmStock: 'Cinestill 800T',
          lens: '24mm Wide',
          camera: 'Sony A7R V',
          aperture: 'f/1.8',
          texture: 'Matte Finish',
          scale: 'Wide Shot (General)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '16:9'
        }
      },

      // --- CINEMATIC / MOVIE STILLS ---
      {
        text: "sitting on a vintage leather sofa, he/she/they looking into the camera lens with gravitas",
        settings: {
          lighting: 'Rembrandt Lighting',
          style: 'Cinematic',
          grading: 'Warm Vintage',
          filmStock: 'Kodak Portra 400',
          lens: '50mm Prime',
          camera: 'Arri Alexa Mini',
          aperture: 'f/1.8',
          texture: 'Raw Skin Texture',
          scale: 'Close-up (Head/Shoulder)',
          pose: 'Sitting / Crouching',
          angle: 'Eye Level',
          ratio: '16:9'
        }
      },
      {
        text: "dramatic silhouette standing against a massive burning sunset, epic scale",
        settings: {
          lighting: 'Rim Lighting',
          style: 'Cinematic',
          grading: 'Warm Vintage',
          filmStock: 'Kodak Portra 400',
          lens: '200mm Telefoto',
          camera: 'Arri Alexa Mini',
          aperture: 'f/2.8',
          texture: 'Matte Finish',
          scale: 'Extreme Wide Shot',
          pose: 'Three-Quarter Turn',
          angle: 'Low Angle',
          ratio: '2.39:1'
        }
      },
      {
        text: "looking back over shoulder in a classic car, wind blowing hair, retro film look",
        settings: {
          lighting: 'Golden Hour',
          style: 'Cinematic',
          grading: 'Warm Vintage',
          filmStock: 'Kodak Portra 400',
          lens: '35mm Street',
          camera: 'Arri Alexa Mini',
          aperture: 'f/2.8',
          texture: 'Raw Skin Texture',
          scale: 'Close-up (Head/Shoulder)',
          pose: 'Over the Shoulder',
          angle: 'Eye Level',
          ratio: '2:1'
        }
      },

      // --- ABSTRACT / AVANT-GARDE ---
      {
        text: "mid-air parkour jump over urban obstacle, dynamic motion blur background",
        settings: {
          lighting: 'Golden Hour',
          style: 'Avant-garde',
          grading: 'High Saturation',
          filmStock: 'Fujifilm Superia',
          lens: '14mm Ultra-Wide',
          camera: 'Nikon Z9',
          aperture: 'f/4',
          texture: 'Matte Finish',
          scale: 'Wide Shot (General)',
          pose: 'Dynamic Movement',
          angle: 'Worm\'s Eye',
          ratio: '16:9'
        }
      },
      {
        text: "symmetrical shot of a character standing in front of a pastel colored wall, deadpan expression",
        settings: {
          lighting: 'Softbox Studio',
          style: 'Avant-garde',
          grading: 'High Saturation',
          filmStock: 'Fujifilm Superia',
          lens: '24mm Wide',
          camera: 'Arri Alexa Mini',
          aperture: 'f/11',
          texture: 'Matte Finish',
          scale: 'Medium Shot (Chest)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '4:3'
        }
      },
      {
        text: "distorted reflection in a broken mirror shards, psychological horror vibe",
        settings: {
          lighting: 'Gobo Shadows',
          style: 'Avant-garde',
          grading: 'Muted Tones',
          filmStock: 'B&W High Grain',
          lens: '50mm Prime',
          camera: 'Sony A7R V',
          aperture: 'f/1.4',
          texture: 'Raw Skin Texture',
          scale: 'Close-up (Head/Shoulder)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '1:1'
        }
      },

      // --- ETHEREAL / FANTASY / SOFT ---
      {
        text: "floating in water with flowers, ophelia style, dreamy soft focus",
        settings: {
          lighting: 'Softbox Studio',
          style: 'Minimalist',
          grading: 'Muted Tones',
          filmStock: 'Kodak Portra 400',
          lens: '35mm Street',
          camera: 'Canon EOS R5',
          aperture: 'f/1.2',
          texture: 'Soft Skin Gloss',
          scale: 'Medium Shot (Chest)',
          pose: 'Sitting / Crouching',
          angle: 'Overhead',
          ratio: '4:5'
        }
      },
      {
        text: "standing in a field of tall grass at twilight, mystical atmosphere",
        settings: {
          lighting: 'Rim Lighting',
          style: 'Minimalist',
          grading: 'Muted Tones',
          filmStock: 'Cinestill 800T',
          lens: '85mm Portrait',
          camera: 'Sony A7R V',
          aperture: 'f/1.4',
          texture: 'Soft Skin Gloss',
          scale: 'Wide Shot (General)',
          pose: 'Three-Quarter Turn',
          angle: 'Low Angle',
          ratio: '16:9'
        }
      },

      // --- PORTRAIT / STUDIO ---
      {
        text: "classic black and white hollywood glamour portrait, harsh shadows",
        settings: {
          lighting: 'Butterfly Lighting',
          style: 'Cinematic',
          grading: 'Monochrome',
          filmStock: 'B&W High Grain',
          lens: '85mm Portrait',
          camera: 'Leica M11',
          aperture: 'f/4',
          texture: 'Soft Skin Gloss',
          scale: 'Close-up (Head/Shoulder)',
          pose: 'Three-Quarter Turn',
          angle: 'Eye Level',
          ratio: '4:5'
        }
      },
      {
        text: "close up portrait with artistic shadows cast by window blinds (film noir)",
        settings: {
          lighting: 'Gobo Shadows',
          style: 'Minimalist',
          grading: 'Monochrome',
          filmStock: 'B&W High Grain',
          lens: '85mm Portrait',
          camera: 'Sony A7R V',
          aperture: 'f/2.8',
          texture: 'Ultra-Detailed Pores',
          scale: 'Extreme Close-up (Eye/Mouth)',
          pose: 'Frontal Standing',
          angle: 'Eye Level',
          ratio: '4:5'
        }
      },
      {
        text: "double exposure portrait combining face with cityscape",
        settings: {
          lighting: 'Softbox Studio',
          style: 'Avant-garde',
          grading: 'Teal & Orange',
          filmStock: 'Digital Sharp',
          lens: '50mm Prime',
          camera: 'Canon EOS R5',
          aperture: 'f/8',
          texture: 'Matte Finish',
          scale: 'Close-up (Head/Shoulder)',
          pose: '90 Profile View',
          angle: 'Eye Level',
          ratio: '1:1'
        }
      }
    ];

    let newIndex;
    let attempts = 0;
    // Logic to prevent the exact same scenario from repeating immediately
    do {
      newIndex = Math.floor(Math.random() * scenarios.length);
      attempts++;
    } while (newIndex === lastScenarioIndex.current && attempts < 5);

    lastScenarioIndex.current = newIndex;
    const randomScenario = scenarios[newIndex];
    const randomDir = getRandomAngleDir();

    // Apply Scenario Narrative
    setManualDirectives(randomScenario.text);

    // Apply Cohesive Technical Settings from Scenario
    setLighting(randomScenario.settings.lighting);
    setStyle(randomScenario.settings.style);
    setGrading(randomScenario.settings.grading);
    setFilmStock(randomScenario.settings.filmStock);
    setLens(randomScenario.settings.lens);
    setCamera(randomScenario.settings.camera);
    setAperture(randomScenario.settings.aperture);
    setTexture(randomScenario.settings.texture);
    setScale(randomScenario.settings.scale);
    setPose(randomScenario.settings.pose);
    setAngle(randomScenario.settings.angle);
    setRatio(randomScenario.settings.ratio);

    // Randomize direction and slant slightly for realism vs scenario baseline
    setAngleDegree(randomDir.degree);
    setSelectedAngleId(randomDir.id);

    // 30% chance of a slight dutch roll
    if (Math.random() > 0.7) {
      setCameraSlant((Math.floor(Math.random() * 20) - 10).toString());
    } else {
      setCameraSlant('');
    }
  };

  const resetAll = () => {
    setIsStudioMode(false);
    setManualDirectives(''); setAngle('Maintain Original'); setAngleDegree(0); setCameraSlant('');
    setScale('Maintain Original'); setPose('Maintain Original'); setLighting('Maintain Original');
    setFilmStock('Maintain Original'); setStyle('Maintain Original'); setGrading('Maintain Original');
    setTexture('Maintain Original'); setRatio('3:4');
    setCamera('Sony A7R V'); setLens('85mm Portrait'); setAperture('f/1.8');
    setSelectedAngleId('front');
    setStudioBgColor('#ffffff'); setStudioFloorColor('#ffffff');
    setStudioBgTexture('Sonsuz Fon (Infinity)'); setStudioFloorTexture('Sonsuz Fon (Infinity)');
  };

  useEffect(() => {
    const out = (e: MouseEvent) => {
      if (angleMenuRef.current && !angleMenuRef.current.contains(e.target as Node)) setIsAngleMenuOpen(false);
      if (scaleMenuRef.current && !scaleMenuRef.current.contains(e.target as Node)) setIsScaleMenuOpen(false);
      if (poseMenuRef.current && !poseMenuRef.current.contains(e.target as Node)) setIsPoseMenuOpen(false);
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  return (
    <div className="min-h-screen relative bg-[#050505] text-white font-sans selection:bg-pink-500/40 py-4 md:py-8 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-[120px]"></div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Removed isolation: isolate to allow z-index to work globally across panels on mobile */
        .glass-panel { background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(40px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4); }
        .glass-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.3s; height: 44px; }
        .glass-input:focus { border-color: rgba(236, 72, 153, 0.4); outline: none; }
        .glass-input:disabled { opacity: 0.2; cursor: not-allowed; }
        .dropdown-menu { background: #000000 !important; border: 1px solid rgba(255, 255, 255, 0.25) !important; z-index: 1000 !important; position: absolute; left: 0; right: 0; max-height: 300px; overflow-y: auto; border-radius: 1rem; margin-top: 0.25rem; width: 100%; }
        .dropdown-item { background: #000000 !important; color: #ffffff !important; transition: all 0.2s; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: bold; padding: 0.75rem 1rem; font-size: 10px; text-transform: uppercase; text-align: left; }
        .dropdown-item:hover { background: #111111 !important; color: #db2777 !important; }
        .angle-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .angle-btn:hover { filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.6)); scale: 1.1; }
        .prompt-btn-root { position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
        .prompt-btn { border-radius: 9999px; width: 100%; height: 100%; z-index: 20; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: all 0.8s; }
        @keyframes success-glow { 0% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); } 50% { box-shadow: 0 0 100px rgba(34, 197, 94, 1); } 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); } }
        .animate-success { animation: success-glow 1.5s infinite; }
        .studio-btn { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); height: 44px; }
        .studio-btn.active { background: white !important; color: black !important; box-shadow: 0 0 40px rgba(255,255,255,0.4); }
        .color-dot { width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: scale 0.2s; position: relative; overflow: hidden; }
        .color-dot input { position: absolute; opacity: 0; cursor: pointer; width: 100%; height: 100%; left:0; top:0;}
        .color-dot:hover { scale: 1.2; }
      `}} />

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col w-full px-4 md:px-8">
        <header className="mb-8 flex items-center justify-between shrink-0 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/5 border border-white/10 rounded-2xl shadow-xl"><MinimalistLogo /></div>
            <div className="flex flex-col items-start gap-0 md:flex-row md:items-center md:gap-3 shrink-0">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white drop-shadow-md">
                Re-angle!
              </h1>
              <div className="relative shrink-0">
                <span className="bg-pink-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(219,39,119,0.3)] whitespace-nowrap">
                  V1-OFFLINE
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
            <p className="text-zinc-500 text-[7px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 whitespace-nowrap">
              Created by Ulaş Çolaker
            </p>
            <a
              href="https://www.instagram.com/ulas.cr2/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Instagram size={14} className="md:w-[18px] md:h-[18px]" />
            </a>
          </div>
        </header>

        {/* Added relative z-index to children containers to ensure they stack correctly on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 relative">
          <div className="lg:col-span-8 flex flex-col gap-6 relative z-20">
            <div className="glass-panel p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 relative">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="z-10 bg-white/5 p-4 rounded-full border border-white/10 flex flex-col items-center backdrop-blur-md shadow-inner">
                      <User className="w-6 h-6 text-pink-500 opacity-80" />
                      <span className="text-[7px] font-black text-white uppercase mt-1 tracking-widest">Bakış ({angleDegree}°)</span>
                    </div>
                    {angleDirections.map((dir) => {
                      const radius = 68;
                      const x = Math.cos((dir.iconPos * Math.PI) / 180) * radius;
                      const y = Math.sin((dir.iconPos * Math.PI) / 180) * radius;
                      const isActive = selectedAngleId === dir.id;
                      return (
                        <button key={dir.id} onClick={(e) => { e.stopPropagation(); setAngleDegree(dir.degree); setSelectedAngleId(dir.id); }}
                          className={`absolute angle-btn p-2 rounded-full z-20 transition-all ${isActive ? 'bg-pink-600 shadow-[0_0_25px_rgba(219,39,119,0.6)] scale-110' : 'bg-white/5'}`}
                          style={{ transform: `translate(${x}px, ${y}px)` }}><Play size={8} className={isActive ? 'text-white' : 'text-zinc-500'} style={{ transform: `rotate(${dir.iconPos}deg)` }} /></button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">Kamera Açısı</span>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2"><Zap className="text-yellow-400 w-4 h-4" /><label className="text-[11px] font-black text-pink-500 uppercase tracking-widest text-white font-bold">Manual Override</label></div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); resetAll(); }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest">Sıfırla</button>
                      <button onClick={(e) => { e.stopPropagation(); enhanceDirectives(); }} disabled={isStudioMode} className={`px-4 py-1.5 bg-pink-600 border border-pink-500 rounded-lg shadow-lg hover:bg-pink-500 text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 ${isStudioMode ? 'opacity-20 cursor-not-allowed' : ''}`}>
                        <Sparkles size={10} /> Rastgele Fikir
                      </button>
                    </div>
                  </div>
                  <textarea value={manualDirectives} onChange={(e) => setManualDirectives(e.target.value)} disabled={isStudioMode} rows={3} className="w-full glass-input !h-32 rounded-2xl px-6 py-4 text-sm text-zinc-100 outline-none resize-none focus:ring-2 focus:ring-pink-500/40 placeholder:text-zinc-600 transition-all shadow-inner font-medium" placeholder={isStudioMode ? "Studio Mode Aktif: Manuel prompt kilitlendi." : dynamicPlaceholder} />
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 px-1"><EyeOff size={14} className="text-red-500" /><span className="text-[10px] font-black uppercase text-zinc-400 font-bold">Negative Prompt</span></div>
                    <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} rows={2} className="w-full glass-input !h-16 rounded-xl px-3 py-2 text-[10px] text-zinc-400 select-all leading-relaxed" />
                  </div>
                </div>
              </div>

              <div className="border-y border-white/10 py-6 bg-white/[0.01] -mx-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <DropdownComponent label="Teknik Açı" icon={<Move size={18} />} value={((translations.angles as Record<string, string>)[angle])} options={options.angles} translations={translations.angles as Record<string, string>} isOpen={isAngleMenuOpen} setOpen={setIsAngleMenuOpen} onChange={setAngle} menuRef={angleMenuRef} />
                <DropdownComponent label="Plan Ayarları" icon={<Maximize2 size={18} />} value={((translations.scales as Record<string, string>)[scale])} options={options.scales} translations={translations.scales as Record<string, string>} isOpen={isScaleMenuOpen} setOpen={setIsScaleMenuOpen} onChange={setScale} menuRef={scaleMenuRef} />
                <DropdownComponent label="Model Pozu" icon={<PersonStanding size={20} />} value={((translations.poses as Record<string, string>)[pose])} options={options.poses} translations={translations.poses as Record<string, string>} isOpen={isPoseMenuOpen} setOpen={setIsPoseMenuOpen} onChange={setPose} menuRef={poseMenuRef} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 relative">
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><Palette size={14} className="text-pink-500" /> Art Direction</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label="Aydınlatma" icon={<Sun size={12} />} value={lighting} options={options.lights} onChange={setLighting} translations={translations.lights as Record<string, string>} />
                    <SelectorComponent label="Renk Grading" icon={<Palette size={12} />} value={grading} options={options.grading} onChange={setGrading} translations={translations.grading as Record<string, string>} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label="Cilt Dokusu" icon={<Fingerprint size={12} />} value={texture} options={options.texture} onChange={setTexture} translations={translations.texture as Record<string, string>} />
                    <SelectorComponent label="Görsel Stil" icon={<Sparkles size={12} />} value={style} options={options.styles} onChange={setStyle} translations={translations.styles as Record<string, string>} />
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><HardDrive size={14} className="text-red-500" /> Optical Lab</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label="Kamera" icon={<Camera size={12} />} value={camera} options={options.cameras} onChange={setCamera} />
                    <SelectorComponent label="Lens Optiği" icon={<Telescope size={12} />} value={lens} options={options.lenses} onChange={setLens} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label="Diyafram" icon={<Gauge size={12} />} value={aperture} options={options.apertures} onChange={setAperture} />
                    <SelectorComponent label="Film Stock" icon={<Film size={12} />} value={filmStock} options={options.films} onChange={setFilmStock} translations={translations.films as Record<string, string>} />
                  </div>
                </section>
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row gap-6 items-end relative">
                <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block px-1">Yön (° Orbital)</span>
                    <div className="relative flex items-center"><Compass className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={angleDegree} onChange={(e) => setAngleDegree(parseInt(e.target.value) || 0)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold" /></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block px-1">Eğim (° Dutch)</span>
                    <div className="relative flex items-center"><RotateCw className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={cameraSlant} onChange={(e) => setCameraSlant(e.target.value)} placeholder="0" className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-[11px] font-black text-pink-500 text-center outline-none focus:ring-2 focus:ring-pink-500/40 font-bold" /><span className="absolute right-3 text-[10px] font-black text-pink-500/40 font-bold">°</span></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block px-1">En-Boy Oranı</span>
                    <SelectorComponent label="" icon={<Layout size={10} />} value={ratio} options={options.ratios} onChange={setRatio} />
                  </div>
                </div>

                <button onClick={() => setIsStudioMode(!isStudioMode)} className={`studio-btn px-8 rounded-2xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest border border-white/10 shadow-xl shrink-0 ${isStudioMode ? 'active' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  <Box size={18} className={isStudioMode ? 'text-black' : 'text-pink-500'} /> Studio Mode
                </button>
              </div>

              {/* STUDIO ENVIRONMENT SUB-CONTROLS */}
              {/* Added relative z-index to dropdowns within this expanded section to avoid clipping */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5 transition-all duration-700 relative ${isStudioMode ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible h-0 overflow-hidden'}`}>
                <SelectorComponent
                  label="Arka Plan"
                  icon={<Layers size={14} />}
                  value={studioBgTexture}
                  options={translations.studioTextures as string[]}
                  onChange={handleBgTextureChange}
                  colorPicker={{ val: studioBgColor, set: setStudioBgColor }}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block px-1 text-white font-bold">Bg HEX</span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioBgColor} onChange={(e) => setStudioBgColor(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
                <SelectorComponent
                  label="Zemin Mat."
                  icon={<Mountain size={14} />}
                  value={studioFloorTexture}
                  options={translations.floorTextures as string[]}
                  onChange={handleFloorTextureChange}
                  colorPicker={{ val: studioFloorColor, set: setStudioFloorColor }}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 block px-1 text-white font-bold">Zemin HEX</span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioFloorColor} onChange={(e) => setStudioFloorColor(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 relative z-10">


            <div className="glass-panel p-6 rounded-[2.5rem] flex-1 flex flex-col min-h-[450px] relative">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2"><Code size={16} className="text-pink-500" /><span className="text-[11px] font-black uppercase tracking-widest text-white font-bold">JSON Prompt</span></div>
                {copied && <span className="text-[10px] font-black text-green-500 uppercase animate-pulse font-bold">Kopyalandı!</span>}
              </div>
              <div className="flex-1 w-full bg-black/40 rounded-2xl p-4 border border-white/5 overflow-auto font-mono text-[10px] text-zinc-400 select-all leading-relaxed shadow-inner custom-scrollbar">
                <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
              </div>
              <div className="flex flex-col items-center justify-center pt-6">
                <div className="prompt-btn-root">
                  <div className={`absolute inset-[-10px] rounded-full border decoration-layer transition-all duration-1000 ${copied ? 'border-green-500/60 animate-success' : 'border-pink-500/40'}`} />
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className={`prompt-btn transition-all duration-700 ${copied ? 'bg-green-600 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-black/60 border-pink-500/40 hover:border-pink-500'}`}>
                    {copied ? <Check size={24} className="text-white mb-2" /> : <ClipboardCopy size={24} className="text-white mb-2" />}
                    <h2 className="text-[12px] font-black uppercase italic tracking-widest text-white">{copied ? 'KOPYALANDI' : 'KOPYALA'}</h2>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
