import React from 'react';

interface LogoProps {
  /**
   * 'light' for light backgrounds (dark navy text & mark)
   * 'dark' for dark backgrounds (white text & mark)
   * Defaults to 'light'
   */
  variant?: 'light' | 'dark';
  /**
   * 'sm' (height ~32px)
   * 'md' (height ~40px)
   * 'lg' (height ~52px)
   * 'xl' (height ~68px)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the company name "Semoga Kerja" */
  showText?: boolean;
  /** Only render the emblem/icon without any text */
  symbolOnly?: boolean;
  /** Optional secondary subtitle */
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showText = true,
  symbolOnly = false,
  subtitle,
  className = '',
}) => {
  const isDark = variant === 'dark';
  const mainColor = isDark ? '#FFFFFF' : '#0B192C';
  const blueAccent = '#2563EB';

  const sizeConfigs = {
    sm: {
      symbolWidth: 32,
      symbolHeight: 32,
      titleSize: 'text-sm sm:text-base font-extrabold',
      subtitleSize: 'text-[10px]',
      gap: 'gap-2.5',
    },
    md: {
      symbolWidth: 40,
      symbolHeight: 40,
      titleSize: 'text-base sm:text-lg font-black',
      subtitleSize: 'text-[11px]',
      gap: 'gap-3',
    },
    lg: {
      symbolWidth: 54,
      symbolHeight: 54,
      titleSize: 'text-xl sm:text-2xl font-black',
      subtitleSize: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      symbolWidth: 72,
      symbolHeight: 72,
      titleSize: 'text-2xl sm:text-3xl font-black',
      subtitleSize: 'text-xs sm:text-sm',
      gap: 'gap-4',
    },
  };

  const currentSize = sizeConfigs[size];

  // SVG representation of the official SK monogram emblem
  const Emblem = (
    <div
      className="shrink-0 flex items-center justify-center transition-transform"
      style={{ width: currentSize.symbolWidth, height: currentSize.symbolHeight }}
      aria-label="Logo PT Semoga Kerja"
    >
      <svg
        viewBox="0 0 300 300"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        <defs>
          <linearGradient id="skBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Monogram SK Stylized Geometry from Official Brandmark */}
        {/* S upper curve, central bridge and lower hook */}
        <path
          d="M 52 58
             C 24 58 6 82 6 120
             C 6 156 30 180 68 184
             L 128 189
             C 152 191 166 201 166 217
             C 166 236 146 250 114 250
             L 34 250
             C 20 250 10 240 10 226
             L 0 226
             C 0 264 28 278 68 278
             L 130 278
             C 178 278 206 250 206 208
             C 206 170 178 152 134 146
             L 80 142
             C 56 138 42 128 42 114
             C 42 96 60 86 88 86
             L 162 86
             C 176 86 186 96 186 110
             L 224 110
             C 224 72 196 58 152 58
             Z"
          fill={mainColor}
        />

        {/* K Upper Branch - Vibrant Blue Leaf Accent */}
        <path
          d="M 188 68
             C 192 64 234 36 268 64
             C 284 78 278 114 246 128
             C 216 142 184 108 188 68
             Z"
          fill="url(#skBlueGrad)"
        />

        {/* K Lower Leg - Navy solid branch */}
        <path
          d="M 148 164
             L 238 266
             C 248 277 258 278 272 278
             L 288 278
             L 182 154
             Z"
          fill={mainColor}
        />
      </svg>
    </div>
  );

  if (symbolOnly || !showText) {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {Emblem}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`${currentSize.titleSize} tracking-tight select-none`}
            style={{ color: mainColor }}
          >
            Semoga Kerja
          </span>
          {/* Subtle company dot or badge */}
        </div>
        {subtitle && (
          <span
            className={`${currentSize.subtitleSize} font-medium mt-0.5 tracking-normal select-none`}
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
