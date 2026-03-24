import React from 'react';

type LogoProps = {
  className?: string;
  variant?: 'book' | 'capelo' | 'pencil';
}

export function Logo({ className = "size-8", variant = "capelo" }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="p-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {variant === 'book' && (
        <>
          {/* Opção 2 anterior: The Book-Mark PMJ */}
          <path 
            d="M 25 78 V 40 C 25 10, 48 10, 48 40 C 48 68, 65 68, 65 40" 
            stroke="url(#p-grad)" 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M 48 40 C 48 68, 65 68, 65 40 C 65 10, 85 10, 85 40 V 73" 
            stroke="url(#m-grad)" 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ mixBlendMode: 'multiply' }}
            opacity="0.95"
          />
        </>
      )}

      {variant === 'capelo' && (
        <>
          {/* Opção 1: O Capelo Retrô-Futurista */}
          {/* Chapéu / Losango do Topo */}
          <path 
            d="M50 18 L76 33 L50 48 L24 33 Z" 
            fill="url(#p-grad)" 
          />
          {/* Detalhe do Cordão/Pingente */}
          <path d="M76 33 V43 C76 46, 80 47, 80 50" stroke="url(#p-grad)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="52" r="2.5" fill="#2563eb" />

          {/* Fitas/Páginas Fluindo por baixo */}
          <path 
            d="M26 60 C26 60 41 73 50 73 C59 73 74 60 74 60" 
            stroke="url(#m-grad)" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          <path 
            d="M23 68 C23 68 40 82 50 82 C60 82 77 68 77 68" 
            stroke="url(#m-grad)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            opacity="0.6"
          />
        </>
      )}

      {variant === 'pencil' && (
        <>
          {/* Opção 3: O Lápis de Crescimento (Dashboard + Educação) */}
          {/* Ponta do Lápis */}
          <path d="M50 12 L74 34 H26 Z" fill="url(#p-grad)" />
          {/* Grafite / Núcleo central */}
          <path d="M50 12 L56 17.5 H44 Z" fill="#1e293b" opacity="0.9" />
          
          {/* Barras de Crescimento (Corpo do Lápis) */}
          <rect x="26" y="40" width="12" height="15" rx="3" fill="url(#m-grad)" />
          <rect x="44" y="40" width="12" height="28" rx="3" fill="url(#m-grad)" />
          <rect x="62" y="40" width="12" height="42" rx="3" fill="url(#m-grad)" />
        </>
      )}
    </svg>
  );
}
