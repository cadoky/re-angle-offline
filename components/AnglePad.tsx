import React, { useRef } from 'react';

// Top to bottom; keys are the engine's elevation values, angles are the camera's height on the sphere.
const rows: [string, number][] = [['Overhead', 80], ["Bird's Eye", 55], ['High Angle', 28], ['Eye Level', 8], ['Low Angle', -18], ["Worm's Eye", -36]];
const EYE = 3;
const KEEP = 'Maintain Original';
const STEP = 15;
const R = 66; // camera distance from the subject's chest, viewBox units
const TILT = (22 * Math.PI) / 180; // the viewer looks down at the scene a little
const FEET = -46; // world y of the ground

interface AnglePadProps {
    orbit: number | null; // 0..359, null = keep reference
    elevation: string;
    onChange: (orbit: number | null, elevation: string) => void;
    elevationLabels: Record<string, string>;
    sideLabels: { back: string; right: string; front: string; left: string };
    keepLabel: string;
    hint: string;
}

const norm = (d: number) => ((d % 360) + 360) % 360;
const clampRow = (i: number) => Math.min(rows.length - 1, Math.max(0, i));

// World: x to the viewer's right, y up, z towards the viewer. Positive orbit moves the camera to the
// photographer's right, i.e. the subject's left, which is the viewer's right since the subject faces us.
const project = (x: number, y: number, z: number) => ({
    sx: x,
    sy: -y * Math.cos(TILT) + z * Math.sin(TILT),
    depth: z * Math.cos(TILT) + y * Math.sin(TILT),
});

// Pseudo-3D scene: a figure on a ground ring and a camera on a sphere around them. Drag left/right orbits, up/down changes height.
const AnglePad: React.FC<AnglePadProps> = ({ orbit, elevation, onChange, elevationLabels, sideLabels, keepLabel, hint }) => {
    const row = rows.findIndex(([k]) => k === elevation);
    const isKeep = orbit === null && row < 0;
    const drag = useRef<{ x: number; y: number; orbit: number; row: number; moved: boolean } | null>(null);

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.moved && Math.hypot(dx, dy) < 4) return;
        d.moved = true;
        const w = e.currentTarget.getBoundingClientRect().width;
        onChange(norm(Math.round((d.orbit + (dx / w) * 360) / STEP) * STEP), rows[clampRow(d.row + Math.round(dy / (w / 7)))][0]);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        const dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        const dy = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!dx && !dy) return;
        e.preventDefault();
        onChange(dx ? norm((orbit ?? 0) + dx * STEP) : orbit, dy ? rows[clampRow((row < 0 ? EYE : row) + dy)][0] : (row < 0 ? KEEP : elevation));
    };

    const theta = ((orbit ?? 0) * Math.PI) / 180;
    const phi = (rows[row < 0 ? EYE : row][1] * Math.PI) / 180;
    const r = R * Math.cos(phi);
    const cam = project(r * Math.sin(theta), R * Math.sin(phi), r * Math.cos(theta));
    const ring = project(0, FEET, 0);
    const orbitRing = project(0, R * Math.sin(phi), 0);
    const camAngle = (Math.atan2(-cam.sy, -cam.sx) * 180) / Math.PI;
    const camScale = 1 + cam.depth / (R * 2.5);
    const readout = isKeep ? keepLabel : [orbit === null ? null : `${orbit}°`, row < 0 ? null : elevationLabels[elevation]].filter(Boolean).join(' · ');
    const dim = orbit === null || row < 0;

    const camera = (opacity: number) => (
        <g opacity={opacity}>
            <line x1={cam.sx} y1={cam.sy} x2={0} y2={-14} stroke="#ec4899" strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="3 3" />
            <g transform={`translate(${cam.sx} ${cam.sy}) rotate(${camAngle}) scale(${camScale})`}>
                <rect x={-9} y={-6} width={14} height={12} rx={2.5} fill={dim ? '#9d174d' : '#ec4899'} stroke="#fff" strokeWidth={1.2} />
                <path d="M 5 -4 L 11 -7 L 11 7 L 5 4 Z" fill={dim ? '#9d174d' : '#ec4899'} stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
            </g>
        </g>
    );

    return (
        <div className="flex flex-col items-center gap-2 w-44">
            <div
                role="group"
                tabIndex={0}
                aria-label={readout}
                onPointerDown={e => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = { x: e.clientX, y: e.clientY, orbit: orbit ?? 0, row: row < 0 ? EYE : row, moved: false };
                }}
                onPointerMove={onPointerMove}
                onPointerUp={() => { drag.current = null; }}
                onPointerCancel={() => { drag.current = null; }}
                onKeyDown={onKeyDown}
                className="relative w-44 h-44 rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-grab active:cursor-grabbing select-none focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                style={{ touchAction: 'none' }}
            >
                <svg viewBox="-100 -100 200 200" className="w-full h-full pointer-events-none">
                    {/* ground ring with the four sides as seen from in front of the subject */}
                    <ellipse cx={0} cy={ring.sy} rx={R} ry={R * Math.sin(TILT)} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" />
                    <text x={0} y={ring.sy + R * Math.sin(TILT) + 11} textAnchor="middle" fontSize={9} fontWeight={900} fill="#d4d4d8">{sideLabels.front}</text>
                    <text x={34} y={ring.sy - R * Math.sin(TILT) * Math.sqrt(1 - (34 / R) ** 2) - 3} textAnchor="middle" fontSize={9} fontWeight={900} fill="#71717a">{sideLabels.back}</text>
                    <text x={-R - 4} y={ring.sy + 3} textAnchor="end" fontSize={9} fontWeight={900} fill="#71717a">{sideLabels.right}</text>
                    <text x={R + 4} y={ring.sy + 3} textAnchor="start" fontSize={9} fontWeight={900} fill="#71717a">{sideLabels.left}</text>
                    {/* the camera's own height ring */}
                    {r > 4 && <ellipse cx={0} cy={orbitRing.sy} rx={r} ry={r * Math.sin(TILT)} fill="none" stroke="rgba(236,72,153,0.35)" strokeDasharray="3 4" />}
                    {!isKeep && cam.depth < 0 && camera(1)}
                    {/* figure facing the viewer */}
                    <g fill="#3f3f46" stroke="#a1a1aa" strokeWidth={1.2} strokeLinejoin="round">
                        <path d={`M -7 ${-FEET * Math.cos(TILT) - 2} L -5 -2 L 5 -2 L 7 ${-FEET * Math.cos(TILT) - 2} L 2 ${-FEET * Math.cos(TILT) - 2} L 0 10 L -2 ${-FEET * Math.cos(TILT) - 2} Z`} />
                        <path d="M -12 -24 Q 0 -29 12 -24 L 10 0 L -10 0 Z" />
                        <path d="M -12 -24 L -16 -2 L -13 -1 L -9 -18 M 12 -24 L 16 -2 L 13 -1 L 9 -18" />
                        <circle cx={0} cy={-36} r={8} />
                    </g>
                    <circle cx={-3} cy={-37} r={1.1} fill="#ec4899" />
                    <circle cx={3} cy={-37} r={1.1} fill="#ec4899" />
                    {/* a camera behind the figure shows through as a ghost */}
                    {!isKeep && camera(cam.depth >= 0 ? 1 : 0.4)}
                </svg>
            </div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest -mt-1">{hint}</span>
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
