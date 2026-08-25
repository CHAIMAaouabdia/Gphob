interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Phob_G logo: a shield (protection/safety) with an upward path
 * of ascending steps (gradual exposure) leading to a star (reward),
 * enclosed in a calm gradient circle.
 */
export default function Logo({ size = 48, className = '', showText = false, textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="phobg-bg" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="phobg-steps" x1="8" y1="48" x2="40" y2="16">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Background circle with gradient */}
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#phobg-bg)" />

        {/* Shield outline (safety) */}
        <path
          d="M32 12 L48 18 L48 32 C48 42 41 50 32 54 C23 50 16 42 16 32 L16 18 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.4"
        />

        {/* Ascending steps (gradual exposure) */}
        <rect x="14" y="42" width="7" height="6" rx="1.5" fill="url(#phobg-steps)" />
        <rect x="22" y="35" width="7" height="6" rx="1.5" fill="url(#phobg-steps)" />
        <rect x="30" y="28" width="7" height="6" rx="1.5" fill="url(#phobg-steps)" />
        <rect x="38" y="21" width="7" height="6" rx="1.5" fill="url(#phobg-steps)" />

        {/* Star at the top (reward) */}
        <path
          d="M41 11 L42.5 14.5 L46 15 L43.5 17.5 L44 21 L41 19.2 L38 21 L38.5 17.5 L36 15 L39.5 14.5 Z"
          fill="#fbbf24"
          className="anim-logo-pulse"
        />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight ${textClassName}`}>
          Phob<span className="text-emerald-500">_</span>G
        </span>
      )}
    </div>
  );
}
