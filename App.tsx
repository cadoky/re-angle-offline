import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronRight,
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
  Globe,
  TriangleAlert
} from 'lucide-react';

import HelpTooltip from './components/HelpTooltip';
import MinimalistLogo from './components/MinimalistLogo';
import SelectorComponent from './components/SelectorComponent';
import DropdownComponent from './components/DropdownComponent';
import HowItWorksModal from './components/HowItWorksModal';
import { angleDirections, locales, options } from './data/constants';
import { lightingPrompts } from './data/promptText';
import { scenarios } from './data/scenarios';
import { buildPrompt, defaultSettings, getWarnings, targets, type Settings, type Target } from './engine/buildPrompt';

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const angleMenuRef = useRef<HTMLDivElement>(null);
  const scaleMenuRef = useRef<HTMLDivElement>(null);
  const poseMenuRef = useRef<HTMLDivElement>(null);
  const lastScenarioIndex = useRef<number>(-1);

  // --- LOCALIZATION STATE ---
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const t = locales[lang];

  // --- STATE ---
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLightingHelpOpen, setIsLightingHelpOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const update = <K extends keyof Settings>(key: K) => (val: Settings[K]) => setSettings(prev => ({ ...prev, [key]: val }));
  const {
    manualDirectives, angle, angleDegree, cameraSlant, lens, scale, pose, ratio, lighting, filmStock, camera, aperture,
    style, grading, texture, negativePrompt, isStudioMode, studioBgColor, studioBgTexture, studioFloorColor, studioFloorTexture,
    gelColorLeft, gelColorRight, gelColorBack
  } = settings;
  const [target, setTarget] = useState<Target>('gemini');
  const selectedAngleId = angleDirections.find(d => d.degree === ((angleDegree % 360) + 360) % 360)?.id;

  // New Lighting Mode State
  const [lightingMode, setLightingMode] = useState<'basic' | 'advanced'>('advanced');

  // UI States
  const [isAngleMenuOpen, setIsAngleMenuOpen] = useState(false);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptChanged, setPromptChanged] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('');

  const toggleLanguage = () => {
    setLang(prev => prev === 'tr' ? 'en' : 'tr');
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
  const generatedPrompt = useMemo(() => buildPrompt(settings, target), [settings, target]);
  const warnings = getWarnings(settings);

  useEffect(() => {
    setPromptChanged(true);
    const timer = setTimeout(() => setPromptChanged(false), 500);
    return () => clearTimeout(timer);
  }, [generatedPrompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, err => console.error('Failed to copy', err));
  };

  const enhanceDirectives = () => {
    if (isStudioMode) return;

    let newIndex;
    let attempts = 0;
    do {
      newIndex = Math.floor(Math.random() * scenarios.length);
      attempts++;
    } while (newIndex === lastScenarioIndex.current && attempts < 5);
    lastScenarioIndex.current = newIndex;

    const scenario = scenarios[newIndex];
    const randomDir = angleDirections[Math.floor(Math.random() * angleDirections.length)];
    setSettings(prev => ({
      ...prev,
      ...scenario.settings,
      manualDirectives: scenario.text,
      angleDegree: randomDir.degree,
      cameraSlant: Math.random() > 0.7 ? (Math.floor(Math.random() * 20) - 10).toString() : '',
    }));
  };

  const resetAll = () => setSettings(defaultSettings);
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
        <div className="flex justify-start mb-6">
          <button onClick={() => setIsHowItWorksOpen(true)} className="text-[10px] font-black uppercase text-pink-500 hover:text-pink-400 tracking-widest transition-colors flex items-center gap-2 group">
            <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
            {t.labels.howItWorks}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8 relative">
          <div className="lg:col-span-8 flex flex-col gap-6 relative z-20">
            <div className="glass-panel p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col gap-8 relative">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="z-10 bg-white/5 p-4 rounded-full border border-white/10 flex flex-col items-center backdrop-blur-md shadow-inner">
                      <User className="w-6 h-6 text-pink-500 opacity-80" />
                      <span className="text-[7px] font-black text-white uppercase mt-1 tracking-widest">{t.labels.view} ({angleDegree}°)</span>
                    </div>
                    {angleDirections.map((dir) => {
                      const radius = 66;
                      const x = Math.cos((dir.iconPos * Math.PI) / 180) * radius;
                      const y = Math.sin((dir.iconPos * Math.PI) / 180) * radius;
                      const isActive = selectedAngleId === dir.id;
                      return (
                        <button key={dir.id} onClick={(e) => { e.stopPropagation(); update('angleDegree')(dir.degree); }}
                          className={`absolute angle-btn w-7 h-7 flex items-center justify-center rounded-full z-20 transition-all ${isActive ? 'bg-pink-600 shadow-[0_0_25px_rgba(219,39,119,0.6)] scale-110' : 'bg-white/5'}`}
                          style={{ transform: `translate(${x}px, ${y}px)` }}><ChevronRight size={14} strokeWidth={3} className={isActive ? 'text-white' : 'text-zinc-500'} style={{ transform: `rotate(${dir.iconPos}deg)` }} /></button>
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
                  <textarea value={manualDirectives} onChange={(e) => update('manualDirectives')(e.target.value)} disabled={isStudioMode} rows={3} className="w-full glass-input !h-32 rounded-2xl px-6 py-4 text-sm text-zinc-100 outline-hidden resize-none focus:ring-2 focus:ring-pink-500/40 placeholder:text-zinc-600 transition-all shadow-inner font-medium" placeholder={isStudioMode ? t.placeholders.studioModeLocked : dynamicPlaceholder} />
                  {target === 'sd' && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 px-1"><EyeOff size={14} className="text-red-500" /><span className="text-[10px] font-black uppercase text-zinc-400 font-bold">{t.labels.negativePrompt}</span></div>
                      <textarea value={negativePrompt} onChange={(e) => update('negativePrompt')(e.target.value)} rows={2} className="w-full glass-input !h-16 rounded-xl px-3 py-2 text-[10px] text-zinc-400 select-all leading-relaxed" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-y border-white/10 py-6 bg-white/[0.01] -mx-4 px-4 md:-mx-8 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <DropdownComponent label={t.labels.technicalAngle} icon={<Move size={18} />} value={((t.options.angles as Record<string, string>)[angle])} options={options.angles} translations={t.options.angles as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isAngleMenuOpen} setOpen={setIsAngleMenuOpen} onChange={update('angle')} menuRef={angleMenuRef} />
                <DropdownComponent label={t.labels.shotSettings} icon={<Maximize2 size={18} />} value={((t.options.scales as Record<string, string>)[scale])} options={options.scales} translations={t.options.scales as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isScaleMenuOpen} setOpen={setIsScaleMenuOpen} onChange={update('scale')} menuRef={scaleMenuRef} />
                <DropdownComponent label={t.labels.modelPose} icon={<PersonStanding size={20} />} value={((t.options.poses as Record<string, string>)[pose])} options={options.poses} translations={t.options.poses as Record<string, string>} helpTexts={t.helpDescriptions} isOpen={isPoseMenuOpen} setOpen={setIsPoseMenuOpen} onChange={update('pose')} menuRef={poseMenuRef} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:px-2 relative">
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2 justify-between">
                    <div className="flex items-center gap-2"><Palette size={14} className="text-pink-500" /> {t.labels.artDirection}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsLightingHelpOpen(true)} className="text-[9px] font-bold text-pink-500 hover:text-white transition-colors bg-pink-500/10 hover:bg-pink-500 px-2 py-1 rounded-md uppercase tracking-wider">{t.labels.lightHelp}</button>
                    </div>
                  </h3>
                  <div className="grid grid-cols-1">
                    <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl relative">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <label className="text-[8px] font-black uppercase tracking-widest px-1 flex items-center gap-2 font-bold text-white">
                          {t.labels.lighting}
                          <HelpTooltip text={t.helpDescriptions['Aydınlatma'] || t.helpDescriptions['Lighting']} />
                        </label>
                        <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10">
                          <button onClick={() => setLightingMode('basic')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${lightingMode === 'basic' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.labels.basic}</button>
                          <button onClick={() => setLightingMode('advanced')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${lightingMode === 'advanced' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.labels.advanced}</button>
                        </div>
                      </div>
                      <SelectorComponent
                        label=""
                        icon={<Sun size={12} />}
                        value={lighting}
                        options={lightingMode === 'basic' ? options.lightsBasic : options.lightsAdvanced}
                        onChange={update('lighting')}
                        translations={t.options.lights as Record<string, string>}
                        helpTexts={t.helpDescriptions}
                      />
                    </div>
                  </div>

                  {/* COLOURED GELS SUB-CONTROLS */}
                  <div className={`grid grid-cols-3 gap-2 pt-2 border-t border-white/5 transition-all duration-500 overflow-hidden ${lighting === 'Coloured Gels' ? 'opacity-100 max-h-24 py-2' : 'opacity-0 max-h-0'}`}>
                    <div className="flex flex-col gap-1 items-stretch">
                      <span className="text-[8px] font-black text-zinc-500 uppercase flex justify-between">{t.labels.gelLeft}</span>
                      {gelColorLeft ? (
                        <div className="w-full h-8 rounded-lg border border-white/10 relative overflow-hidden shadow-xs group" style={{ backgroundColor: gelColorLeft }}>
                          <input type="color" value={gelColorLeft} onChange={(e) => update('gelColorLeft')(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                          <button onClick={(e) => { e.stopPropagation(); update('gelColorLeft')('') }} className="absolute top-0 right-0 h-full w-6 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ) : (
                        <button onClick={() => update('gelColorLeft')('#ff004c')} className="w-full h-8 rounded-lg border border-dashed border-white/20 hover:border-pink-500/50 hover:bg-pink-500/10 text-white/40 hover:text-pink-500 flex items-center justify-center text-[10px] font-black transition-all">+</button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-stretch">
                      <span className="text-[8px] font-black text-zinc-500 uppercase flex justify-between">{t.labels.gelRight}</span>
                      {gelColorRight ? (
                        <div className="w-full h-8 rounded-lg border border-white/10 relative overflow-hidden shadow-xs group" style={{ backgroundColor: gelColorRight }}>
                          <input type="color" value={gelColorRight} onChange={(e) => update('gelColorRight')(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                          <button onClick={(e) => { e.stopPropagation(); update('gelColorRight')('') }} className="absolute top-0 right-0 h-full w-6 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ) : (
                        <button onClick={() => update('gelColorRight')('#00eaff')} className="w-full h-8 rounded-lg border border-dashed border-white/20 hover:border-pink-500/50 hover:bg-pink-500/10 text-white/40 hover:text-pink-500 flex items-center justify-center text-[10px] font-black transition-all">+</button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-stretch">
                      <span className="text-[8px] font-black text-zinc-500 uppercase flex justify-between">{t.labels.gelBack}</span>
                      {gelColorBack ? (
                        <div className="w-full h-8 rounded-lg border border-white/10 relative overflow-hidden shadow-xs group" style={{ backgroundColor: gelColorBack }}>
                          <input type="color" value={gelColorBack} onChange={(e) => update('gelColorBack')(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                          <button onClick={(e) => { e.stopPropagation(); update('gelColorBack')('') }} className="absolute top-0 right-0 h-full w-6 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ) : (
                        <button onClick={() => update('gelColorBack')('#9d00ff')} className="w-full h-8 rounded-lg border border-dashed border-white/20 hover:border-pink-500/50 hover:bg-pink-500/10 text-white/40 hover:text-pink-500 flex items-center justify-center text-[10px] font-black transition-all">+</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.grading} icon={<Palette size={12} />} value={grading} options={options.grading} onChange={update('grading')} translations={t.options.grading as Record<string, string>} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.skinTexture} icon={<Fingerprint size={12} />} value={texture} options={options.texture} onChange={update('texture')} translations={t.options.texture as Record<string, string>} helpTexts={t.helpDescriptions} />
                    <div className="col-span-2"><SelectorComponent label={t.labels.visualStyle} icon={<Sparkles size={12} />} value={style} options={options.styles} onChange={update('style')} translations={t.options.styles as Record<string, string>} helpTexts={t.helpDescriptions} /></div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2"><HardDrive size={14} className="text-red-500" /> {t.labels.opticalLab}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.camera} icon={<Camera size={12} />} value={camera} options={options.cameras} onChange={update('camera')} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.lensOptics} icon={<Telescope size={12} />} value={lens} options={options.lenses} onChange={update('lens')} helpTexts={t.helpDescriptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectorComponent label={t.labels.aperture} icon={<Gauge size={12} />} value={aperture} options={options.apertures} onChange={update('aperture')} helpTexts={t.helpDescriptions} />
                    <SelectorComponent label={t.labels.filmStock} icon={<Film size={12} />} value={filmStock} options={options.films} onChange={update('filmStock')} translations={t.options.films as Record<string, string>} helpTexts={t.helpDescriptions} />
                  </div>
                </section>
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row gap-6 items-end relative">
                <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.orbitalDirection} <HelpTooltip text={t.helpDescriptions['Yön (° Orbital)'] || t.helpDescriptions['Direction (° Orbital)']} /></span>
                    <div className="relative flex items-center"><Compass className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={angleDegree} onChange={(e) => update('angleDegree')(parseInt(e.target.value) || 0)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold" /></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.dutchTilt} <HelpTooltip text={t.helpDescriptions['Eğim (° Dutch)'] || t.helpDescriptions['Tilt (° Dutch)']} /></span>
                    <div className="relative flex items-center"><RotateCw className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="number" value={cameraSlant} onChange={(e) => update('cameraSlant')(e.target.value)} placeholder="0" className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-[11px] font-black text-pink-500 text-center outline-hidden focus:ring-2 focus:ring-pink-500/40 font-bold" /><span className="absolute right-3 text-[10px] font-black text-pink-500/40 font-bold">°</span></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 flex items-center gap-2">{t.labels.aspectRatio} <HelpTooltip text={t.helpDescriptions['En-Boy Oranı'] || t.helpDescriptions['Aspect Ratio']} /></span>
                    <SelectorComponent label="" icon={<Layout size={10} />} value={ratio} options={options.ratios} onChange={update('ratio')} />
                  </div>
                </div>

                <button onClick={() => update('isStudioMode')(!isStudioMode)} className={`studio-btn px-8 rounded-2xl flex items-center gap-3 font-black text-[12px] uppercase tracking-widest border border-white/10 shadow-xl shrink-0 ${isStudioMode ? 'active' : 'bg-white/5 text-white hover:bg-white/10'}`}>
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
                  onChange={update('studioBgTexture')}
                  colorPicker={{ val: studioBgColor, set: update('studioBgColor') }}
                  helpTexts={t.helpDescriptions}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 text-white font-bold flex items-center gap-2">{t.labels.bgHex} <HelpTooltip text={t.helpDescriptions['Bg HEX'] || t.helpDescriptions['Bg HEX']} /></span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioBgColor} onChange={(e) => update('studioBgColor')(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
                <SelectorComponent
                  label={t.labels.floorMat}
                  icon={<Mountain size={14} />}
                  value={studioFloorTexture}
                  options={Object.keys(t.options.studioTextures)} // Reusing studio textures for floor
                  translations={t.options.studioTextures as Record<string, string>}
                  onChange={update('studioFloorTexture')}
                  colorPicker={{ val: studioFloorColor, set: update('studioFloorColor') }}
                  helpTexts={t.helpDescriptions}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 text-white font-bold flex items-center gap-2">{t.labels.floorHex} <HelpTooltip text={t.helpDescriptions['Zemin HEX'] || t.helpDescriptions['Floor HEX']} /></span>
                  <div className="relative flex items-center"><Pipette className="absolute left-3 text-pink-500 opacity-60" size={14} /><input type="text" value={studioFloorColor} onChange={(e) => update('studioFloorColor')(e.target.value)} className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 relative z-10 h-full">


            <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col h-full relative justify-between">
              <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <div className="flex items-center gap-2"><Code size={16} className="text-pink-500" /><span className="text-[11px] font-black uppercase tracking-widest text-white font-bold">{target === 'gemini' ? t.labels.jsonPrompt : t.labels.prompt}</span></div>
                {copied && <span className="text-[10px] font-black text-green-500 uppercase animate-pulse font-bold">{t.labels.copied}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4 px-2 shrink-0">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{t.labels.targetModel}</span>
                <div className="grid grid-cols-4 bg-black/40 rounded-lg p-0.5 border border-white/10">
                  {targets.map(tg => (
                    <button key={tg} onClick={() => setTarget(tg)} className={`px-1 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${target === tg ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.targets[tg]}</button>
                  ))}
                </div>
                {warnings.map(w => (
                  <div key={w} className="flex items-start gap-2 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1.5"><TriangleAlert size={12} className="shrink-0 mt-px" />{t.warnings[w]}</div>
                ))}
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
      <HowItWorksModal
        isOpen={isLightingHelpOpen}
        onClose={() => setIsLightingHelpOpen(false)}
        title={t.labels.lightHelp}
        body={(lightingMode === 'basic' ? options.lightsBasic : options.lightsAdvanced)
          .filter(k => lightingPrompts[k])
          .map(k => `**${(t.options.lights as Record<string, string>)[k]}**: ${lightingPrompts[k]}`).join('\n')}
      />
    </div>
  );
};

export default App;
