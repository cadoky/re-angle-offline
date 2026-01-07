import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import { SelectorProps } from '../types';
import { safeString } from '../utils/helpers';

const SelectorComponent: React.FC<SelectorProps> = ({ label, icon, value, options: menuOptions, onChange, translations: menuTranslations, helpTexts, disabled = false, colorPicker = null }) => {
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
            {label && <label className={`text-[8px] font-black uppercase tracking-widest px-1 flex items-center gap-2 mb-1.5 font-bold ${disabled ? 'text-zinc-700' : 'text-white'}`}>
                {label}
                {helpTexts && helpTexts[label] && <HelpTooltip text={helpTexts[label]} />}
            </label>}
            <div onClick={(e) => { if (!disabled) { e.stopPropagation(); setOpen(!isOpen); } }} className={`w-full flex items-center gap-2 text-[10px] font-black glass-input px-3 py-2.5 rounded-xl border border-white/10 hover:border-pink-500/40 shadow-sm transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <span className={`opacity-50 ${disabled ? 'text-zinc-700' : 'text-pink-500'}`}>{icon}</span>

                <div className="flex-1 text-left truncate uppercase text-white font-bold outline-none flex items-center justify-between">
                    <span className="ml-1">{menuTranslations ? menuTranslations[safeString(value)] : safeString(value)}</span>
                    {!disabled && <ChevronDown size={10} className={`text-pink-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
                </div>

                {colorPicker && !disabled && (
                    <div onClick={(e) => e.stopPropagation()} className="color-dot ml-2 shadow-lg" style={{ backgroundColor: colorPicker.val }}>
                        <input type="color" value={colorPicker.val} onChange={(e) => colorPicker.set(e.target.value)} />
                    </div>
                )}
            </div>

            {isOpen && !disabled && (
                <div className={`dropdown-menu rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-[0_20px_50px_rgba(0,0,0,1)] w-full custom-scrollbar ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    {menuOptions?.map((opt) => (
                        <button key={opt} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }} className="dropdown-item w-full text-left font-bold">{menuTranslations ? menuTranslations[opt] : opt}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectorComponent;
