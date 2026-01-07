import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import { DropdownProps } from '../types';
import { safeString } from '../utils/helpers';

const DropdownComponent: React.FC<DropdownProps> = ({ label, icon, value, options: menuOptions, translations: menuTranslations, helpTexts, isOpen, setOpen, onChange, menuRef }) => {
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
            <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 tracking-widest px-1 text-white font-bold flex items-center gap-2">
                {label}
                {helpTexts && helpTexts[label] && <HelpTooltip text={helpTexts[label]} />}
            </span>
            <button onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }} className="w-full flex items-center gap-3 text-[11px] font-black border border-white/10 px-4 py-3 rounded-xl bg-black/40 hover:border-pink-500/40 shadow-lg justify-between transition-all cursor-pointer">
                <div className="flex items-center gap-2 text-pink-500">{icon} <span className="text-white truncate max-w-[120px] uppercase font-bold">{safeString(value)}</span></div>
                <ChevronDown size={14} className={`text-pink-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className={`dropdown-menu rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-[0_20px_50px_rgba(0,0,0,1)] w-full custom-scrollbar ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    {menuOptions?.map((opt) => (
                        <button key={opt} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }} className="dropdown-item w-full text-left">{menuTranslations ? menuTranslations[opt] : opt}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownComponent;
