import React from 'react';
import { X } from 'lucide-react';

// I'll stick to simple splitting for now to avoid bad deps.

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    body: string;
}

const HowItWorksModal: React.FC<ModalProps> = ({ isOpen, onClose, title, body }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-[#0a0a0a] border border-pink-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(236,72,153,0.15)] animate-in fade-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-black uppercase italic tracking-wider text-pink-500 mb-6 drop-shadow-md">
                    {title}
                </h2>
                <div className="text-xs md:text-sm text-zinc-300 leading-relaxed space-y-4 font-medium">
                    {body.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') ? 'pl-2' : ''}>
                            {line.split('**').map((part, index) =>
                                index % 2 === 1 ? <strong key={index} className="text-white">{part}</strong> : part
                            )}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorksModal;
