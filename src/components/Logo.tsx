import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'large';
}

export function Logo({ className = "size-8" }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
          <stop offset="100%" stopColor="#1e3a8a" /> {/* blue-900 */}
        </linearGradient>
        <linearGradient id="grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
          <stop offset="100%" stopColor="#60a5fa" /> {/* blue-400 */}
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.25"/>
        </filter>
      </defs>
      
      {/* Outer Hexagon Shield (Abstract Protection & Logic) */}
      <path 
        d="M50 8 L86 28 V72 L50 92 L14 72 V28 Z" 
        fill="url(#logo-bg)" 
        filter="url(#shadow)"
        className="transition-all duration-300"
      />
      
      {/* Inner Frame Overlay for digital vibe */}
      <path d="M50 14 L81 31 V69 L50 86 L19 31 V14 Z" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.4" />
      
      {/* abstract Design: Floating Cap/Diamond at top */}
      <path 
        d="M50 30 L68 38 L50 46 L32 38 Z" 
        fill="url(#grad-accent)" 
      />
      
      {/* Open book forming pages with lightwave profiles */}
      <path 
        d="M36 42 C36 42 44 47 50 47 C56 47 64 42 64 42" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.95"
      />
      <path 
        d="M34 49 C34 49 43 55 50 55 C57 55 66 49 66 49" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.9"
      />
      <path 
        d="M32 56 C32 56 42 63 50 63 C58 63 68 56 68 56" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.8"
      />
      <path 
        d="M30 63 C30 63 41 71 50 71 C59 71 70 63 70 63" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        opacity="0.6"
      />
      
      {/* Digital Node Connectivity / Core line */}
      <line x1="50" y1="46" x2="50" y2="76" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2" />
      <circle cx="50" cy="38" r="4" fill="#ffffff" />
      <circle cx="50" cy="76" r="3" fill="#38bdf8" />
    </svg>
  );
}
