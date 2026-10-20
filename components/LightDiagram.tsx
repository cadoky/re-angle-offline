import React from 'react';
import { lightingSetups, type Light } from '../data/lightingSetups';

const R = 78; // plot radius in viewBox units
const BACKDROP = -94;
const clamp = (v: number) => Math.max(-90, Math.min(90, v));

// Shapes are drawn facing +y (towards the subject after rotation), long side along x.
const shape = (l: Light, fill: string) => {
  const k = l.size ?? 1;
  switch (l.kind) {
    case 'box': return <rect x={-10 * k} y={-4} width={20 * k} height={8} rx={1.5} fill={fill} />;
    case 'strip': return <rect x={-4} y={-6} width={8} height={12} rx={1} fill={fill} />;
    case 'umbrella': return <g fill="none" stroke={fill} strokeWidth={2.5}><path d={`M ${-11 * k} 2 Q 0 -12 ${11 * k} 2`} /><line x1={0} y1={-5} x2={0} y2={4} /></g>;
    case 'spot': return <g fill={fill}><path d={`M -4 3 L ${-8 * k} 14 L ${8 * k} 14 L 4 3 Z`} opacity={0.35} /><circle r={4.5} /></g>;
    case 'sun': return <g stroke={fill} strokeWidth={2}>{[0, 45, 90, 135, 180, 225, 270, 315].map(a => <line key={a} x1={0} y1={12} x2={0} y2={16} transform={`rotate(${a})`} />)}<circle r={9} fill={fill} stroke="none" /></g>;
    case 'reflector': return <line x1={-12} y1={0} x2={12} y2={0} stroke="#a1a1aa" strokeWidth={3} strokeLinecap="round" />;
  }
};

const LightDiagram: React.FC<{ setup: string; colors?: Record<string, string>; className?: string }> = ({ setup, colors, className }) => {
  const s = lightingSetups[setup];
  if (!s) return null;
  return (
    <svg viewBox="-100 -100 200 200" className={className} role="img" aria-label={setup}>
      <line x1={-90} y1={BACKDROP} x2={90} y2={BACKDROP} stroke="rgba(255,255,255,0.15)" strokeWidth={3} strokeLinecap="round" />
      {s.lights.map((l, i) => {
        const c = colors && l.color && l.color in colors ? colors[l.color] : l.color;
        if (c === '') return null;
        const fill = c || '#f4f4f5';
        const px = l.x * R, py = l.y * R;
        const [tx, ty] = l.aim === 'bg' ? [px, BACKDROP] : [0, 0];
        const deg = (Math.atan2(ty - py, tx - px) * 180) / Math.PI;
        const len = Math.hypot(px, py) || 1;
        return (
          <g key={i}>
            <line x1={px} y1={py} x2={tx} y2={ty} stroke={fill} strokeOpacity={0.45} strokeWidth={1.2} strokeDasharray="3 3" />
            <g transform={`translate(${px} ${py}) rotate(${deg - 90})`}>{shape(l, fill)}</g>
            <text x={clamp(px + (px / len) * 20)} y={clamp(py + (py / len) * 20) + 3} textAnchor="middle" fontSize={12} fontWeight={700} fill="#d4d4d8">{l.label}</text>
          </g>
        );
      })}
      <g transform={`rotate(${-(s.face ?? 0)})`}>
        <path d="M -4 9 L 0 17 L 4 9 Z" fill="#ec4899" />
        <circle r={11} fill="#27272a" stroke="#ec4899" strokeWidth={2} />
      </g>
      <g transform="translate(0 88)" fill="#71717a">
        <rect x={-9} y={-5} width={18} height={11} rx={2} />
        <rect x={-4} y={-9} width={8} height={5} rx={1} />
      </g>
    </svg>
  );
};

export default LightDiagram;
