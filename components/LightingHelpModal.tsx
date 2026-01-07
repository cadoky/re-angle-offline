import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface LightingHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    imageUrl: string;
}

const LightingHelpModal: React.FC<LightingHelpModalProps> = ({ isOpen, onClose, title, imageUrl }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is restored if component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        // Always prevent default to stop page scroll
        e.preventDefault();
        e.stopPropagation();

        // Zoom logic (no key required)
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, 1), 4);

        setScale(newScale);

        // If zooming out to 1, reset position
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default drag behavior
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (scale > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && scale > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            // Prevent default to stop scrolling the page while dragging
            if (e.cancelable) e.preventDefault();

            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a] z-10">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
                        {title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1 mr-4">
                            <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom Out">
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-[10px] font-mono text-zinc-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom In">
                                <ZoomIn size={16} />
                            </button>
                            <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Fit">
                                <Maximize size={16} />
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-hidden relative bg-[#050505] flex items-center justify-center cursor-move touch-none"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                        className="origin-center"
                    >
                        <img
                            src={imageUrl}
                            alt="Lighting Reference"
                            className="max-w-full max-h-full object-contain pointer-events-none select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Hint Overlay */}
                    {scale === 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-zinc-400 font-bold uppercase tracking-widest pointer-events-none">
                            <span className="flex items-center gap-2">
                                <Move size={12} /> Drag to Pan • Scroll to Zoom
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LightingHelpModal;
