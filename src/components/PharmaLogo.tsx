import React from 'react';

interface PharmaLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export const PharmaLogo: React.FC<PharmaLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  className = '',
}) => {
  // Dimensions based on size
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    xs: { main: 'text-xs', sub: 'text-[9px]' },
    sm: { main: 'text-sm', sub: 'text-[10px]' },
    md: { main: 'text-base', sub: 'text-xs' },
    lg: { main: 'text-xl', sub: 'text-sm' },
    xl: { main: 'text-2xl', sub: 'text-base' },
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon: Capsule Pill + Pin + Supply Chain Network Nodes */}
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Teal Gradient for top half of pill and pin */}
            <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            {/* Dark Blue Gradient for bottom half of pill */}
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f3b68" />
            </linearGradient>

            {/* Pin Gradient */}
            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0d9488" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Speed / Motion Trail Behind Capsule */}
          <path
            d="M 15 88 C 45 82, 75 90, 88 95"
            stroke="#14b8a6"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 28 105 C 50 102, 75 110, 85 115"
            stroke="#0284c7"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 20 128 C 40 148, 80 158, 120 145"
            stroke="#0d9488"
            strokeWidth="5.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Network Connection Lines & Nodes (Supply Chain) */}
          <g stroke="#0369a1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path d="M 105 142 L 132 145" />
            <path d="M 132 145 L 148 122" />
            <path d="M 148 122 L 170 100" />
            <path d="M 148 122 L 160 148" />
            <path d="M 170 100 L 165 72" />
          </g>

          {/* Network Nodes (Dots) */}
          <circle cx="105" cy="142" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="132" cy="145" r="8" fill="#0f3b68" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="148" cy="122" r="7.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="160" cy="148" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <circle cx="170" cy="100" r="7" fill="#14b8a6" stroke="#ffffff" strokeWidth="2.5" />

          {/* Location Pin Icon (Top Right) */}
          <g transform="translate(142, 28) scale(0.92)" filter="url(#logoGlow)">
            <path
              d="M 24 0 C 10.745 0 0 10.745 0 24 C 0 38 24 58 24 58 C 24 58 48 38 48 24 C 48 10.745 37.255 0 24 0 Z"
              fill="url(#pinGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <circle cx="24" cy="22" r="8.5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Capsule Pill (Tilted 45deg, with realistic 3D division) */}
          <g transform="translate(98, 85) rotate(-42) translate(-40, -75)">
            {/* Pill Body Container */}
            <g filter="url(#logoGlow)">
              {/* Top Half (Teal) */}
              <path
                d="M 10 40 C 10 20, 25 8, 40 8 C 55 8, 70 20, 70 40 L 70 70 L 10 70 Z"
                fill="url(#tealGrad)"
              />
              {/* Bottom Half (Navy Blue) */}
              <path
                d="M 10 74 L 70 74 L 70 104 C 70 124, 55 136, 40 136 C 25 136, 10 124, 10 104 Z"
                fill="url(#blueGrad)"
              />
              {/* Center Divider Gap */}
              <line x1="8" y1="72" x2="72" y2="72" stroke="#ffffff" strokeWidth="3" />
              
              {/* Inner Pill Gloss Highlight */}
              <path
                d="M 22 22 C 28 14, 38 14, 42 16 C 36 24, 36 45, 36 60"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.45"
              />
              {/* Outline contour */}
              <rect
                x="10"
                y="8"
                width="60"
                height="128"
                rx="30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Typography: PharmaYemen + فارما يمن */}
      {variant === 'full' && (
        <div className="flex flex-col text-right justify-center">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-black tracking-tight font-sans ${textSizes[size].main} ${
              theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-slate-900' : 'text-slate-900 dark:text-white'
            }`}>
              Pharma<span className="text-teal-500 dark:text-teal-400">Yemen</span>
            </span>
          </div>
          
          {/* Subtitle framed by lines: — فارما يمن — */}
          <div className="flex items-center gap-1.5 mt-0.5 opacity-90">
            <div className="h-[1.5px] w-2.5 sm:w-3.5 bg-teal-500/70 rounded-full" />
            <span className={`font-black tracking-wide text-teal-600 dark:text-teal-300 ${textSizes[size].sub}`}>
              فارما يمن
            </span>
            <div className="h-[1.5px] w-2.5 sm:w-3.5 bg-teal-500/70 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
