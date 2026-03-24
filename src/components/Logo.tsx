import React from 'react';

export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="minimal-g-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
          <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
        </linearGradient>
        <linearGradient id="minimal-g-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* sky-500 */}
        </linearGradient>
      </defs>

      {/* 
        Design Minimalista SaaS de Mercado:
        Dois retângulos com cantos super arredondados (Swooshes) intersecting, 
        criando uma forma de "P" e "M" abstratos ou um Livro contínuo.
      */}

      {/* Forma 1: Vertical principal */}
      <rect 
        x="24" y="20" width="18" height="60" rx="9" 
        fill="url(#minimal-g-1)" 
      />
      
      {/* Forma 2: Arco lateral que cruza e fecha um portal/Livro */}
      <path 
        d="M30 20 H60 C73.8 20 85 31.2 85 45 C85 58.8 73.8 70 60 70 H46" 
        stroke="url(#minimal-g-2)" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />

      {/* Pequeno ponto de destaque (Glow/Node) minimalista */}
      <circle cx="60" cy="45" r="5" fill="white" />
    </svg>
  );
}
