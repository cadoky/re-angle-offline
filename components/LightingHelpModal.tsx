import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface LightingHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    imageUrl: string;
}

const LightingHelpModal: React.FC<LightingHelpModalProps> = ({ isOpen, onClose, title, imageUrl }) => {

    useEffect(() => {
        if (isOpen) {
            // Lock body scroll
            document.body.style.overflow = 'hidden';

            // Prevent default touch actions on the body to ensure the modal receives them exclusively
            // This is an extra safety measure mostly for iOS
            document.body.style.touchAction = 'none';

        } else {
            // Restore body scroll
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                    limitToBounds={true} // Keeps image within boundaries
                >
                    {({ zoomIn, zoomOut, resetTransform, state }) => (
                        <React.Fragment>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a] z-10">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
                                    {title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1 mr-4">
                                        <button onClick={() => zoomOut()} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom Out">
                                            <ZoomOut size={16} />
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-500 w-12 text-center">
                                            {Math.round(state.scale * 100)}%
                                        </span>
                                        <button onClick={() => zoomIn()} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom In">
                                            <ZoomIn size={16} />
                                        </button>
                                        <button onClick={() => resetTransform()} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors" title="Fit">
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
                            <div className="flex-1 overflow-hidden relative bg-[#050505] flex items-center justify-center w-full h-full">
                                <TransformComponent
                                    wrapperStyle={{ width: "100%", height: "100%" }}
                                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt="Lighting Reference"
                                        className="max-w-full max-h-full object-contain pointer-events-none select-none"
                                        draggable={false}
                                    />
                                </TransformComponent>

                                {/* Hint Overlay */}
                                {state.scale === 1 && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-zinc-400 font-bold uppercase tracking-widest pointer-events-none z-20">
                                        <span className="flex items-center gap-2">
                                            <Move size={12} /> Drag to Pan • Pinch to Zoom
                                        </span>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    )}
                </TransformWrapper>
            </div>
        </div>
    );
};

export default LightingHelpModal;
