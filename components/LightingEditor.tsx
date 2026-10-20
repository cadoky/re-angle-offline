import React, { useState } from 'react';
import { Plus, Trash2, X, Sun, Lightbulb, Aperture, ArrowUpDown } from 'lucide-react';
import LightDiagram, { R } from './LightDiagram';
import SelectorComponent from './SelectorComponent';
import { customToLight } from '../data/lightingSetups';
import { lightHeights, lightModifiers, lightRoles, lightTypes, MAX_LIGHTS, type CustomLight } from '../engine/buildPrompt';

type T = { labels: Record<string, string>; options: Record<string, Record<string, string>> };

interface LightingEditorProps {
    isOpen: boolean;
    onClose: () => void;
    lights: CustomLight[];
    onChange: (lights: CustomLight[]) => void;
    t: T;
}

// Starting point for the n-th light added, so a fresh plot reads as a classic setup.
export const presets: Omit<CustomLight, 'color'>[] = [
    { x: -0.64, y: 0.64, role: 'Key', type: 'Strobe', modifier: 'Softbox', height: 'High' },
    { x: 0.6, y: 0.6, role: 'Fill', type: 'Strobe', modifier: 'Umbrella', height: 'Eye Level' },
    { x: 0.7, y: -0.7, role: 'Rim', type: 'Strobe', modifier: 'Stripbox', height: 'High' },
    { x: -0.35, y: -0.6, role: 'Background', type: 'Strobe', modifier: 'Bare Bulb', height: 'Low' },
    { x: 0.2, y: -0.45, role: 'Hair', type: 'Strobe', modifier: 'Honeycomb Grid', height: 'Overhead' },
];

const toDeg = (l: CustomLight) => Math.round((Math.atan2(l.x, l.y) * 180) / Math.PI);
const polar = (deg: number, r: number) => ({ x: r * Math.sin((deg * Math.PI) / 180), y: r * Math.cos((deg * Math.PI) / 180) });
// Keep lights inside the plot and off the subject.
const place = (x: number, y: number) => {
    const r = Math.min(1, Math.max(0.25, Math.hypot(x, y)));
    const a = Math.atan2(x, y);
    return { x: +(r * Math.sin(a)).toFixed(2), y: +(r * Math.cos(a)).toFixed(2) };
};

const LightingEditor: React.FC<LightingEditorProps> = ({ isOpen, onClose, lights, onChange, t }) => {
    const [sel, setSel] = useState(0);
    const [dragging, setDragging] = useState<number | null>(null);
    if (!isOpen) return null;

    const L = t.labels;
    const current = lights[Math.min(sel, lights.length - 1)];
    const idx = Math.min(sel, lights.length - 1);
    const patch = (p: Partial<CustomLight>) => onChange(lights.map((l, i) => (i === idx ? { ...l, ...p } : l)));
    const add = () => {
        if (lights.length >= MAX_LIGHTS) return;
        const used = new Set(lights.map(l => l.role));
        const preset = presets.find(p => !used.has(p.role)) || presets[lights.length];
        onChange([...lights, { ...preset, color: '#ffffff' }]);
        setSel(lights.length);
    };
    const remove = () => { onChange(lights.filter((_, i) => i !== idx)); setSel(Math.max(0, idx - 1)); };

    const svgPoint = (e: React.PointerEvent<SVGSVGElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        return place((((e.clientX - r.left) / r.width) * 200 - 100) / R, (((e.clientY - r.top) / r.height) * 200 - 100) / R);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center md:p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#0a0a0a] border border-pink-500/30 md:rounded-3xl w-full max-w-5xl h-[100dvh] md:h-auto md:max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(236,72,153,0.15)] p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg md:text-xl font-black uppercase italic tracking-wider text-pink-500">{L.customLight}</h2>
                    <button onClick={onClose} aria-label={L.done} className="text-zinc-500 hover:text-white"><X size={22} /></button>
                </div>
                <p className="text-[11px] text-zinc-400 mb-4">{L.customLightHint}</p>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Stage: preset-diagram drawing underneath, drag handles on top in the same viewBox. */}
                    <div className="relative w-full max-w-[420px] mx-auto md:mx-0 aspect-square shrink-0 rounded-2xl border border-white/10 bg-black/50">
                        <LightDiagram setup="" lights={lights.map(customToLight)} className="absolute inset-0 w-full h-full" />
                        <svg
                            viewBox="-100 -100 200 200"
                            className="absolute inset-0 w-full h-full"
                            style={{ touchAction: 'none' }}
                            onPointerMove={e => { if (dragging !== null) onChange(lights.map((l, i) => (i === dragging ? { ...l, ...svgPoint(e) } : l))); }}
                            onPointerUp={() => setDragging(null)}
                            onPointerCancel={() => setDragging(null)}
                        >
                            {lights.map((l, i) => (
                                <g key={i} className="cursor-grab" onPointerDown={e => { (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId); setSel(i); setDragging(i); }}>
                                    <circle cx={l.x * R} cy={l.y * R} r={15} fill="transparent" stroke={i === idx ? '#ec4899' : 'transparent'} strokeWidth={2} strokeDasharray="4 3" />
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        <div className="flex flex-wrap gap-2">
                            {lights.map((l, i) => (
                                <button key={i} onClick={() => setSel(i)} className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest ${i === idx ? 'bg-pink-600 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}>
                                    <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: l.color }} />
                                    {i + 1}. {t.options.lightRoles[l.role] || l.role}
                                </button>
                            ))}
                            {lights.length < MAX_LIGHTS && (
                                <button onClick={add} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-dashed border-white/20 text-pink-500 hover:bg-pink-500/10 text-[9px] font-black uppercase tracking-widest"><Plus size={12} />{L.addLight} ({lights.length}/{MAX_LIGHTS})</button>
                            )}
                        </div>

                        {current && (
                            <div className="grid grid-cols-2 gap-3">
                                <SelectorComponent label={L.lightRole} icon={<Lightbulb size={12} />} value={current.role} options={lightRoles} translations={t.options.lightRoles} onChange={v => patch({ role: v })} />
                                <SelectorComponent label={L.lightType} icon={<Sun size={12} />} value={current.type} options={lightTypes} translations={t.options.lightTypes} onChange={v => patch({ type: v })} />
                                <SelectorComponent label={L.lightModifier} icon={<Aperture size={12} />} value={current.modifier} options={lightModifiers} translations={t.options.lightModifiers} onChange={v => patch({ modifier: v })} />
                                <SelectorComponent label={L.lightHeight} icon={<ArrowUpDown size={12} />} value={current.height} options={lightHeights} translations={t.options.lightHeights} onChange={v => patch({ height: v })} />
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest px-1 text-white">{L.lightColor}</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {['#ffffff', '#ffd9a8', '#ff8a1f', '#ff004c', '#ec4899', '#9d00ff', '#1e5bff', '#00eaff', '#22c55e'].map(c => (
                                            <button key={c} aria-label={c} onClick={() => patch({ color: c })} className={`w-8 h-8 rounded-lg border ${current.color === c ? 'border-white ring-2 ring-pink-500' : 'border-white/20'}`} style={{ backgroundColor: c }} />
                                        ))}
                                        <label className="relative w-8 h-8 rounded-lg border border-dashed border-white/30 overflow-hidden flex items-center justify-center text-zinc-400 text-xs" style={{ backgroundColor: current.color }}>
                                            <Plus size={12} className="mix-blend-difference" />
                                            <input type="color" value={current.color} onChange={e => patch({ color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </label>
                                    </div>
                                </div>
                                <label className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest px-1 text-white">{L.lightAngle}: {toDeg(current)}°</span>
                                    <input type="range" min={-180} max={180} step={5} value={toDeg(current)} onChange={e => { const p = polar(+e.target.value, Math.hypot(current.x, current.y)); patch(place(p.x, p.y)); }} className="accent-pink-600 h-8" />
                                </label>
                                <label className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest px-1 text-white">{L.lightDistance}</span>
                                    <input type="range" min={0.25} max={1} step={0.05} value={Math.hypot(current.x, current.y)} onChange={e => { const p = polar(toDeg(current), +e.target.value); patch(place(p.x, p.y)); }} className="accent-pink-600 h-8" />
                                </label>
                                <button onClick={remove} className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest"><Trash2 size={12} />{L.removeLight}</button>
                            </div>
                        )}
                        <button onClick={onClose} className="mt-auto h-12 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-[11px] uppercase tracking-widest">{L.done}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LightingEditor;
