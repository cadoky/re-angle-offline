import React, { useState, useEffect, useRef } from 'react';
import { CircleHelp } from 'lucide-react';

const HelpTooltip: React.FC<{ text: string }> = ({ text }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [align, setAlign] = useState<'left' | 'right'>('left');
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            // Check for overflow
            if (tooltipRef.current) {
                const rect = tooltipRef.current.getBoundingClientRect();
                const tooltipWidth = 192; // w-48 approx 192px
                const screenWidth = window.innerWidth;

                // If the tooltip starting at left (rect.left) + width exceeds screen width
                if (rect.left + tooltipWidth > screenWidth - 20) {
                    setAlign('right');
                } else {
                    setAlign('left');
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <span className="relative inline-flex items-center ml-1.5" ref={tooltipRef}>
            <CircleHelp
                size={10}
                className={`cursor-pointer transition-colors ${isOpen ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            />
            {isOpen && (
                <div className={`absolute bottom-full mb-2 w-48 bg-black/90 border border-white/10 rounded-xl p-3 shadow-2xl z-[1500] backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 ${align === 'left' ? 'left-0' : 'right-0'}`}>
                    <p className="text-[10px] leading-relaxed text-zinc-200 font-medium normal-case tracking-normal text-left">
                        {text}
                    </p>
                    <div className={`absolute -bottom-[4px] w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45 ${align === 'left' ? 'left-[5px]' : 'right-[5px]'}`}></div>
                </div>
            )}
        </span>
    );
};

export default HelpTooltip;
