import React from 'react';

// Rows top to bottom; keys are the engine's elevation values.
const rows = ['Overhead', "Bird's Eye", 'High Angle', 'Eye Level', 'Low Angle', "Worm's Eye"];
const KEEP = 'Maintain Original';
const STEP = 15;

interface AnglePadProps {
    orbit: number | null; // 0..359, null = keep reference
    elevation: string;
    onChange: (orbit: number | null, elevation: string) => void;
    elevationLabels: Record<string, string>;
    sideLabels: { back: string; right: string; front: string; left: string };
    keepLabel: string;
}

const norm = (d: number) => ((d % 360) + 360) % 360;
// -180..180 with 0 (front) in the middle of the pad.
const signed = (d: number) => (norm(d) > 180 ? norm(d) - 360 : norm(d));

// X = horizontal orbit around the subject, Y = camera height. One drag sets both.
const AnglePad: React.FC<AnglePadProps> = ({ orbit, elevation, onChange, elevationLabels, sideLabels, keepLabel }) => {
    const row = rows.indexOf(elevation);
    const isKeep = orbit === null && row < 0;

    const fromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const rx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        const ry = Math.min(0.999, Math.max(0, (e.clientY - r.top) / r.height));
        onChange(norm(Math.round((rx * 360 - 180) / STEP) * STEP), rows[Math.floor(ry * rows.length)]);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        const dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        const dy = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!dx && !dy) return;
        e.preventDefault();
        const r = row < 0 ? rows.indexOf('Eye Level') : row;
        onChange(dx ? norm((orbit ?? 0) + dx * STEP) : orbit, dy ? rows[Math.min(rows.length - 1, Math.max(0, r + dy))] : (row < 0 ? KEEP : elevation));
    };

    const x = ((signed(orbit ?? 0) + 180) / 360) * 100;
    const y = ((row < 0 ? rows.indexOf('Eye Level') : row) + 0.5) / rows.length * 100;
    const readout = isKeep ? keepLabel : [orbit === null ? null : `${orbit}°`, row < 0 ? null : elevationLabels[elevation]].filter(Boolean).join(' · ');

    return (
        <div className="flex flex-col items-center gap-2 w-44">
            <div
                role="group"
                tabIndex={0}
                aria-label={readout}
                onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
                onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
                onKeyDown={onKeyDown}
                className="relative w-44 h-44 rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-crosshair select-none focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                style={{ touchAction: 'none' }}
            >
                {rows.map((k, i) => (
                    <div key={k} className={`absolute left-0 right-0 flex items-center pl-1.5 text-[7px] font-black uppercase tracking-wider pointer-events-none ${i === row ? 'text-pink-400 bg-pink-500/10' : 'text-zinc-600'} ${k === 'Eye Level' && i !== row ? 'bg-white/[0.03]' : ''}`} style={{ top: `${(i / rows.length) * 100}%`, height: `${100 / rows.length}%` }}>
                        {elevationLabels[k]}
                    </div>
                ))}
                {[25, 50, 75].map(p => <div key={p} className={`absolute top-0 bottom-0 w-px pointer-events-none ${p === 50 ? 'bg-white/20' : 'bg-white/10'}`} style={{ left: `${p}%` }} />)}
                {!isKeep && (
                    <div className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white pointer-events-none transition-[left,top] duration-100 ${orbit === null || row < 0 ? 'bg-pink-600/40 border-dashed' : 'bg-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.7)]'}`} style={{ left: `${x}%`, top: `${y}%` }} />
                )}
            </div>
            {/* Labels sit under the 0/25/50/75/100% grid lines: -180 back, -90 subject's right, 0 front, 90 subject's left, 180 back. */}
            <div className="relative w-full h-3 text-[7px] font-black uppercase text-zinc-500 -mt-1 pointer-events-none">
                <span className="absolute left-0">{sideLabels.back}</span>
                <span className="absolute left-1/4 -translate-x-1/2">{sideLabels.right}</span>
                <span className="absolute left-1/2 -translate-x-1/2 text-zinc-300">{sideLabels.front}</span>
                <span className="absolute left-3/4 -translate-x-1/2">{sideLabels.left}</span>
                <span className="absolute right-0">{sideLabels.back}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{readout}</span>
                {!isKeep && (
                    <button type="button" onClick={() => onChange(null, KEEP)} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 text-zinc-400 font-bold text-[8px] uppercase tracking-widest">{keepLabel}</button>
                )}
            </div>
        </div>
    );
};

export default AnglePad;
