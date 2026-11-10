import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BatteryIllustration: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-40 h-32',
    md: 'w-64 h-48 sm:w-72 sm:h-52',
    lg: 'w-80 h-60'
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-pink/60 via-red-100/30 to-transparent rounded-full blur-2xl transform scale-90 -z-10" />

      <svg
        viewBox="0 0 400 300"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(169,31,44,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Case Gradient */}
          <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D93845" />
            <stop offset="40%" stop-color="#BA2230" />
            <stop offset="100%" stop-color="#80141E" />
          </linearGradient>

          {/* Top Lid Gradient */}
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4A0B10" />
            <stop offset="100%" stop-color="#280508" />
          </linearGradient>

          {/* Terminal Gradients */}
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E2E8F0" />
            <stop offset="50%" stop-color="#CBD5E1" />
            <stop offset="100%" stop-color="#94A3B8" />
          </linearGradient>

          {/* Leaf Gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#48BB78" />
            <stop offset="100%" stop-color="#22543D" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#68D391" />
            <stop offset="100%" stop-color="#276749" />
          </linearGradient>

          {/* Bolt Glow */}
          <filter id="boltGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#F56565" flood-opacity="0.5" />
          </filter>
        </defs>

        {/* --- LEAF (LEFT BACK) --- */}
        <g transform="translate(45, 90) rotate(-20)">
          <path
            d="M 0 60 C 0 10, 50 0, 90 0 C 90 50, 70 100, 0 100 C 0 85, 0 70, 0 60 Z"
            fill="url(#leafGrad2)"
            opacity="0.9"
          />
          <path d="M 0 100 Q 40 55 90 0" stroke="#C6F6D5" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* --- LEAF (RIGHT BACK) --- */}
        <g transform="translate(295, 75) rotate(25)">
          <path
            d="M 0 65 C 0 15, 60 0, 105 0 C 105 55, 80 110, 0 110 C 0 95, 0 80, 0 65 Z"
            fill="url(#leafGrad1)"
          />
          <path d="M 0 110 Q 50 60 105 0" stroke="#9AE6B4" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* --- BATTERY HANDLE --- */}
        <path
          d="M 125 75 C 125 35, 275 35, 275 75"
          fill="none"
          stroke="url(#silverGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* --- TERMINALS --- */}
        {/* Negative Terminal (Blue - Left) */}
        <g transform="translate(90, 58)">
          <rect x="0" y="8" width="34" height="26" rx="6" fill="url(#silverGrad)" />
          <rect x="4" y="0" width="26" height="12" rx="4" fill="#3182CE" />
          <line x1="11" y1="6" x2="23" y2="6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Positive Terminal (Red - Right) */}
        <g transform="translate(276, 58)">
          <rect x="0" y="8" width="34" height="26" rx="6" fill="url(#silverGrad)" />
          <rect x="4" y="0" width="26" height="12" rx="4" fill="#E53E3E" />
          <line x1="11" y1="6" x2="23" y2="6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="0" x2="17" y2="12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* --- MAIN BATTERY BODY --- */}
        {/* Top Rim Lid */}
        <rect x="62" y="78" width="276" height="34" rx="10" fill="url(#lidGrad)" />
        <rect x="70" y="82" width="260" height="4" rx="2" fill="#78131C" opacity="0.6" />

        {/* Front Red Case */}
        <rect x="68" y="104" width="264" height="162" rx="18" fill="url(#caseGrad)" />
        
        {/* Subtle vertical battery grid lines */}
        <line x1="134" y1="112" x2="134" y2="258" stroke="#78131C" strokeWidth="2.5" opacity="0.4" />
        <line x1="200" y1="112" x2="200" y2="258" stroke="#78131C" strokeWidth="2.5" opacity="0.4" />
        <line x1="266" y1="112" x2="266" y2="258" stroke="#78131C" strokeWidth="2.5" opacity="0.4" />

        {/* Bottom Base shadow trim */}
        <rect x="60" y="260" width="280" height="16" rx="8" fill="#580D14" />

        {/* --- CENTER BADGE WITH LIGHTNING BOLT --- */}
        <g transform="translate(155, 134)" filter="url(#boltGlow)">
          {/* Badge Background */}
          <rect x="0" y="0" width="90" height="96" rx="18" fill="#FFFFFF" />
          <rect x="3" y="3" width="84" height="90" rx="15" fill="#FFF5F2" stroke="#F5CBCD" strokeWidth="2" />
          
          {/* Red Lightning Bolt */}
          <polygon
            points="48,16 28,52 45,52 42,80 66,42 49,42"
            fill="#C93642"
          />
        </g>

        {/* Spec Label Lines under badge */}
        <g transform="translate(100, 240)">
          <rect x="0" y="0" width="200" height="6" rx="3" fill="#FFFFFF" opacity="0.4" />
        </g>

        {/* --- FRONT FOREGROUND LEAVES --- */}
        <g transform="translate(25, 205) rotate(-10)">
          <path
            d="M 0 50 C 0 10, 45 0, 75 0 C 75 40, 60 85, 0 85 Z"
            fill="url(#leafGrad1)"
          />
          <path d="M 0 85 Q 35 45 75 0" stroke="#9AE6B4" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <g transform="translate(325, 210) rotate(18)">
          <path
            d="M 0 45 C 0 8, 40 0, 70 0 C 70 38, 55 75, 0 75 Z"
            fill="url(#leafGrad2)"
          />
          <path d="M 0 75 Q 32 40 70 0" stroke="#C6F6D5" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
