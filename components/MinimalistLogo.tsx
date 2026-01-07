import React from 'react';

const MinimalistLogo: React.FC = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2L16 16L28 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 16L9 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
    </svg>
);

export default MinimalistLogo;
