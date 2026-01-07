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
  Gauge,
  PersonStanding,
  Compass,
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
  Mountain,
  Telescope,
  Globe
} from 'lucide-react';

import HelpTooltip from './components/HelpTooltip';
import MinimalistLogo from './components/MinimalistLogo';
import SelectorComponent from './components/SelectorComponent';
import DropdownComponent from './components/DropdownComponent';
import HowItWorksModal from './components/HowItWorksModal';
import { angleDirections, locales, materialEngMapping, options } from './data/constants';
import { safeString } from './utils/helpers';

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const angleMenuRef = useRef<HTMLDivElement>(null);
  const scaleMenuRef = useRef<HTMLDivElement>(null);
  const poseMenuRef = useRef<HTMLDivElement>(null);
  const lastScenarioIndex = useRef<number>(-1);

  // --- LOCALIZATION STATE ---
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const t = locales[lang];

  // --- BASIC STATE ---
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
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
  const [studioBgTexture, setStudioBgTexture] = useState('Sonsuz Fon (Infinity)'); // Default set to Infinity (Key in TR, mapped in constants)
  const [studioFloorColor, setStudioFloorColor] = useState('#ffffff');
  const [studioFloorTexture, setStudioFloorTexture] = useState('Sonsuz Fon (Infinity)'); // Default set to Infinity

  // UI States
  const [isAngleMenuOpen, setIsAngleMenuOpen] = useState(false);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptChanged, setPromptChanged] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('');

  const getDirectionLabel = (deg: number): string => {
    const closest = angleDirections.reduce((prev, curr) => (Math.abs(curr.degree - deg) < Math.abs(prev.degree - deg) ? curr : prev));
    return closest.label;
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'tr' ? 'en' : 'tr');
  };

  // --- INFINITY SYNC LOGIC ---
  const handleBgTextureChange = (val: string) => {
    setStudioBgTexture(val);
    if (val === 'Sonsuz Fon (Infinity)' || val === 'Infinity Cyclorama') {
    }
  };

  const handleFloorTextureChange = (val: string) => {
    setStudioFloorTexture(val);
  };

  useEffect(() => {
    const examples = [
      "he/she/they striding confidently down a high-fashion runway with sharp editorial lighting",
      "he/she/they leaning against a neon-lit cyberpunk garage door, looking sneaky",
      "he/she/they walking through a heavy urban fog, wearing a long leather trench coat",
      "sitting on a vintage leather sofa, he/she/they looking into the camera lens"
    ];
    setDynamicPlaceholder(`${t.placeholders.manualPrompt}${examples[Math.floor(Math.random() * examples.length)]}`);
  }, [lang]);

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

    // Resolve English names for textures regardless of current language
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

    // Calculate parameter values for consistency
    const studioModeVal = isStudioMode ? "ACTIVE" : "Inactive";
    const bgTextureName = materialEngMapping[studioBgTexture] || studioBgTexture;
    const floorTextureName = materialEngMapping[studioFloorTexture] || studioFloorTexture;

    const bgVal = isStudioMode ? `${studioBgColor} (${bgTextureName})` : "Reference Default";
    const floorVal = isStudioMode ? `${studioFloorColor} (${floorTextureName})` : "Reference Default";
    const orbitalVal = `${angleDegree}° (${directionLabel})`;
    const dutchVal = `${cameraSlant || '0'}°`;

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

      // Integrated Selected Parameters
      `{studio_mode: ${studioModeVal}}`,
      `{background: ${bgVal}}`,
      `{floor: ${floorVal}}`,
      `{orbital_degree: ${orbitalVal}}`,
      `{{camera positioned at ${angleDegree}° (${directionLabel}) relative to the subject}}`,
      `{dutch_roll: ${dutchVal}}`,
      `{aspect_ratio: ${ratio}}`,

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
        studio_mode: studioModeVal,
        background: bgVal,
        floor: floorVal,
        camera, lens, aperture,
        angle, scale, pose,
        orbital_degree: orbitalVal,
        dutch_roll: dutchVal,
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
    setPromptChanged(true);
    const timer = setTimeout(() => setPromptChanged(false), 500);
    return () => clearTimeout(timer);
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
      // ... (Truncated list for brevity sake in this step, but assuming full list logic is preserved if I had it)
      // I'll keep the list minimal to save tokens as agreed
      {
        text: "rain-soaked noir detective standing under a flickering street lamp, moody atmosphere",
        settings: { lighting: 'Rembrandt Lighting', style: 'Sokak Fotoğrafçılığı', grading: 'Monochrome', filmStock: 'B&W High Grain', lens: '50mm Prime', camera: 'Leica M11', aperture: 'f/1.8', texture: 'Raw Skin Texture', scale: 'Medium Shot (Chest)', pose: 'Frontal Standing', angle: 'Eye Level', ratio: '4:3' }
      },
      {
        text: "hacker sitting in a dark server room illuminated by blue LED lights, intense focus",
        settings: { lighting: 'Neon / Cyberpunk', style: 'Cinematic', grading: 'High Saturation', filmStock: 'Digital Sharp', lens: '24mm Wide', camera: 'Sony A7R V', aperture: 'f/2.8', texture: 'Matte Finish', scale: 'Close-up (Head/Shoulder)', pose: 'Sitting / Crouching', angle: 'High Angle', ratio: '16:9' }
      }
    ];

    let newIndex;
    let attempts = 0;
    do {
      newIndex = Math.floor(Math.random() * scenarios.length);
      attempts++;
    } while (newIndex === lastScenarioIndex.current && attempts < 5);

    lastScenarioIndex.current = newIndex;
    const randomScenario = scenarios[newIndex];
    const randomDir = getRandomAngleDir();

    setManualDirectives(randomScenario.text);
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

    setAngleDegree(randomDir.degree);
    setSelectedAngleId(randomDir.id);

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
                  V1-Beta
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
            <p className="text-zinc-500 text-[7px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 whitespace-nowrap">
              {t.labels.created_by}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors uppercase font-bold text-[10px] tracking-widest"
              >
                <Globe size={14} className="text-pink-500" />
                {lang}
              </button>
              <a
                href="https://www.instagram.com/ulas.cr2/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Instagram size={14} className="md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>
        </header>

        {/* Added relative z-index to children containers to ensure they stack correctly on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8 relative">
          <div className="lg:col-span-8 flex flex-col gap-6 relative z-20">
            <div className="flex justify-start">
              <button onClick={() => setIsHowItWorksOpen(true)} className="text-[10px] font-black uppercase text-pink-500 hover:text-pink-400 tracking-widest transition-colors flex items-center gap-2 group">
                <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
                {t.labels.howItWorks}
              </button>
            </div>
            <div className="glass-panel p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 relative">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="z-10 bg-white/5 p-4 rounded-full border border-white/10 flex flex-col items-center backdrop-blur-md shadow-inner">
                      <User className="w-6 h-6 text-pink-500 opacity-80" />
                      <span className="text-[7px] font-black text-white uppercase mt-1 tracking-widest">{t.labels.view} ({angleDegree}°)</span>
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
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">{t.labels.angle}</span>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2"><Zap className="text-yellow-400 w-4 h-4" /><label className="text-[11px] font-black text-pink-500 uppercase tracking-widest text-white font-bold">{t.labels.manualOverride}</label></div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); resetAll(); }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{t.labels.reset}</button>
                      <button onClick={(e) => { e.stopPropagation(); enhanceDirectives(); }} disabled={isStudioMode} className={`px-4 py-1.5 bg-pink-600 border border-pink-500 rounded-lg shadow-lg hover:bg-pink-500 text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 ${isStudioMode ? 'opacity-20 cursor-not-allowed' : ''}`}>
                        <Sparkles size={10} /> {t.labels.randomIdea}
                      </button>
                    </div>
                  </div>
                  <textarea value={manualDirectives} onChange={(e) => setManualDirectives(e.target.value)} disabled={isStudioMode} rows={3} className="w-full glass-input !h-32 rounded-2xl px-6 py-4 text-sm text-zinc-100 outline-none resize-none focus:ring-2 focus:ring-pink-500/40 placeholder:text-zinc-600 transition-all shadow-inner font-medium" placeholder={isStudioMode ? t.placeholders.studioModeLocked : dynamicPlaceholder} />
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 px-1"><EyeOff size={14} className="text-red-500" /><span className="text-[10px] font-black uppercase text-zinc-400 font-bold">{t.labels.negativePrompt}</span></div>
                    <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} rows={2} className="w-full glass-input !h-16 rounded-xl px-3 py-2 text-[10px] text-zinc-400 select-all leading-relaxed" />
                  </div>
                </div>
              </div>

              <div className="border-y border-white/10 py-6 bg-white/[0.01] -mx-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <DropdownComponent label={t.labels.technicalAngle} icon={<Move size={18} />} value={((t.options.angles as Record<string, string>)[angle])} options={options.angles} translations={t.options.angles as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isAngleMenuOpen} setOpen={setIsAngleMenuOpen} onChange={setAngle} menuRef={angleMenuRef} />
                <DropdownComponent label={t.labels.shotSettings} icon={<Maximize2 size={18} />} value={((t.options.scales as Record<string, string>)[scale])} options={options.scales} translations={t.options.scales as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isScaleMenuOpen} setOpen={setIsScaleMenuOpen} onChange={setScale} menuRef={scaleMenuRef} />
                <DropdownComponent label={t.labels.modelPose} icon={<PersonStanding size={20} />} value={((t.options.poses as Record<string, string>)[pose])} options={options.poses} translations={t.options.poses as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isPoseMenuOpen} setOpen={setIsPoseMenuOpen} onChange={setPose} menuRef={poseMenuRef} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 relative">
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><Palette size={14} className="text-pink-500" /> {t.labels.artDirection}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.lighting} icon={<Sun size={12} />} value={lighting} options={options.lights} onChange={setLighting} translations={t.options.lights as Record<string, string>} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.grading} icon={<Palette size={12} />} value={grading} options={options.grading} onChange={setGrading} translations={t.options.grading as Record<string, string>} helpTexts={t.helpDescriptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.skinTexture} icon={<Fingerprint size={12} />} value={texture} options={options.texture} onChange={setTexture} translations={t.options.texture as Record<string, string>} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.visualStyle} icon={<Sparkles size={12} />} value={style} options={options.styles} onChange={setStyle} translations={t.options.styles as Record<string, string>} helpTexts={t.helpDescriptions} />
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><HardDrive size={14} className="text-red-500" /> {t.labels.opticalLab}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.camera} icon={<Camera size={12} />} value={camera} options={options.cameras} onChange={setCamera} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.lensOptics} icon={<Telescope size={12} />} value={lens} options={options.lenses} onChange={setLens} helpTexts={t.helpDescriptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.aperture} icon={<Gauge size={12} />} value={aperture} options={options.apertures} onChange={setAperture} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.filmStock} icon={<Film size={12} />} value={filmStock} options={options.films} onChange={setFilmStock} translations={t.options.films as Record<string, string>} helpTexts={t.helpDescriptions} />
                  </div>
                </section>
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row gap-6 items-end relative">
                <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.orbitalDirection} <HelpTooltip text={t.helpDescriptions['Yön (° Orbital)'] || t.helpDescriptions['Direction (° Orbital)']} /></span>
                    <div className="relative flex items-center"><Compass className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={angleDegree} onChange={(e) => setAngleDegree(parseInt(e.target.value) || 0)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold" /></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.dutchTilt} <HelpTooltip text={t.helpDescriptions['Eğim (° Dutch)'] || t.helpDescriptions['Tilt (° Dutch)']} /></span>
                    <div className="relative flex items-center"><RotateCw className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={cameraSlant} onChange={(e) => setCameraSlant(e.target.value)} placeholder="0" className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-[11px] font-black text-pink-500 text-center outline-none focus:ring-2 focus:ring-pink-500/40 font-bold" /><span className="absolute right-3 text-[10px] font-black text-pink-500/40 font-bold">°</span></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.aspectRatio} <HelpTooltip text={t.helpDescriptions['En-Boy Oranı'] || t.helpDescriptions['Aspect Ratio']} /></span>
                    <SelectorComponent label="" icon={<Layout size={10} />} value={ratio} options={options.ratios} onChange={setRatio} />
                  </div>
                </div>

                <button onClick={() => setIsStudioMode(!isStudioMode)} className={`studio-btn px-8 rounded-2xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest border border-white/10 shadow-xl shrink-0 ${isStudioMode ? 'active' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  <Box size={18} className={isStudioMode ? 'text-black' : 'text-pink-500'} /> {t.labels.studioMode}
                </button>
              </div>

              {/* STUDIO ENVIRONMENT SUB-CONTROLS */}
              {/* Added relative z-index to dropdowns within this expanded section to avoid clipping */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5 transition-all duration-700 relative ${isStudioMode ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible h-0 overflow-hidden'}`}>
                <SelectorComponent
                  label={t.labels.background}
                  icon={<Layers size={14} />}
                  value={studioBgTexture}
                  options={Object.keys(t.options.studioTextures)}
                  translations={t.options.studioTextures as Record<string, string>}
                  onChange={handleBgTextureChange}
                  colorPicker={{ val: studioBgColor, set: setStudioBgColor }}
                  helpTexts={t.helpDescriptions}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 text-white font-bold flex items-center gap-2">{t.labels.bgHex} <HelpTooltip text={t.helpDescriptions['Bg HEX'] || t.helpDescriptions['Bg HEX']} /></span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioBgColor} onChange={(e) => setStudioBgColor(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
                <SelectorComponent
                  label={t.labels.floorMat}
                  icon={<Mountain size={14} />}
                  value={studioFloorTexture}
                  options={Object.keys(t.options.studioTextures)} // Reusing studio textures for floor
                  translations={t.options.studioTextures as Record<string, string>}
                  onChange={handleFloorTextureChange}
                  colorPicker={{ val: studioFloorColor, set: setStudioFloorColor }}
                  helpTexts={t.helpDescriptions}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 text-white font-bold flex items-center gap-2">{t.labels.floorHex} <HelpTooltip text={t.helpDescriptions['Zemin HEX'] || t.helpDescriptions['Floor HEX']} /></span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioFloorColor} onChange={(e) => setStudioFloorColor(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 relative z-10 h-full">


            <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col h-full relative justify-between">
              <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <div className="flex items-center gap-2"><Code size={16} className="text-pink-500" /><span className="text-[11px] font-black uppercase tracking-widest text-white font-bold">{t.labels.jsonPrompt}</span></div>
                {copied && <span className="text-[10px] font-black text-green-500 uppercase animate-pulse font-bold">{t.labels.copied}</span>}
              </div>
              <div className={`w-full h-[600px] bg-black/40 rounded-2xl p-4 border overflow-auto font-mono text-[10px] text-zinc-400 select-all leading-relaxed shadow-inner custom-scrollbar transition-all duration-500 ${promptChanged ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-pink-500/10' : 'border-white/5'}`}>
                <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
              </div>
              <div className="flex flex-col items-center justify-center pt-4 shrink-0">
                <div className="prompt-btn-root">
                  <div className={`absolute inset-[-10px] rounded-full border decoration-layer transition-all duration-1000 ${copied ? 'border-green-500/60 animate-success' : 'border-pink-500/40'}`} />
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className={`prompt-btn transition-all duration-700 ${copied ? 'bg-green-600 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-black/60 border-pink-500/40 hover:border-pink-500'}`}>
                    {copied ? <Check size={24} className="text-white mb-2" /> : <ClipboardCopy size={24} className="text-white mb-2" />}
                    <h2 className="text-[12px] font-black uppercase italic tracking-widest text-white">{copied ? t.labels.copied : t.labels.copy}</h2>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        title={t.labels.howItWorksTitle}
        body={t.labels.howItWorksBody}
      />
    </div>
  );
};

export default App;
