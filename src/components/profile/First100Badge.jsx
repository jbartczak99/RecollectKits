import React from 'react';

// CSS animations - add these to your global CSS or styled-components
export const first100AnimationStyles = `
@keyframes first100Float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes first100Glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.5)); }
  50% { filter: drop-shadow(0 0 22px rgba(251,191,36,0.85)); }
}

@keyframes first100RotateRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes first100Sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes first100StarTwinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes first100PulseGlow {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
}

@keyframes first100RibbonWave {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.02); }
}

@keyframes first100JerseyPulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

@keyframes first100AdoptPulse {
  0%, 100% { opacity: 0.85; letter-spacing: 1.5px; }
  50% { opacity: 1; letter-spacing: 2px; }
}

.first100-badge-container {
  animation: first100Float 4s ease-in-out infinite;
}

.first100-badge-glow {
  animation: first100Glow 2.5s ease-in-out infinite;
}

.first100-rotating-ring {
  animation: first100RotateRing 25s linear infinite;
  transform-origin: center;
}

.first100-sparkle {
  animation: first100Sparkle 2.2s ease-in-out infinite;
}

.first100-star-twinkle {
  animation: first100StarTwinkle 2s ease-in-out infinite;
}

.first100-pulse-glow {
  animation: first100PulseGlow 3s ease-in-out infinite;
}

.first100-ribbon {
  animation: first100RibbonWave 4s ease-in-out infinite;
  transform-origin: center;
}

.first100-jersey-pulse {
  animation: first100JerseyPulse 3s ease-in-out infinite;
}

.first100-adopt-pulse {
  animation: first100AdoptPulse 3s ease-in-out infinite;
}
`;

// Full-size badge for profile pages, about sections, etc.
export const First100Badge = ({ size = 260 }) => {
  const height = size * (218 / 220);

  return (
    <div className="first100-badge-container" style={{ display: 'inline-block' }}>
      <svg
        width={size}
        height={height}
        viewBox="0 0 220 218"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="first100-badge-glow"
      >
        <defs>
          <clipPath id="first100LeftH">
            <rect x="0" y="0" width="110" height="220" />
          </clipPath>
          <clipPath id="first100RightH">
            <rect x="110" y="0" width="110" height="220" />
          </clipPath>
          <clipPath id="first100DiscClip">
            <circle cx="110" cy="105" r="82" />
          </clipPath>
          <linearGradient id="first100ShimG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            <animate attributeName="x1" from="-100%" to="200%" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0%" to="300%" dur="3.5s" repeatCount="indefinite" />
          </linearGradient>
          <linearGradient id="first100GoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Outer rotating decorative ring */}
        <g className="first100-rotating-ring">
          <circle cx="110" cy="105" r="96" fill="none" stroke="url(#first100GoldG)" strokeWidth="1" strokeDasharray="8 4" />
          <circle cx="110" cy="9" r="3" fill="#FBBF24" />
          <circle cx="110" cy="201" r="3" fill="#FBBF24" />
          <circle cx="14" cy="105" r="3" fill="#FBBF24" />
          <circle cx="206" cy="105" r="3" fill="#FBBF24" />
        </g>

        {/* Sparkles around badge */}
        <circle className="first100-sparkle" cx="28" cy="42" r="2" fill="#FDE68A" style={{ animationDelay: '0s' }} />
        <circle className="first100-sparkle" cx="192" cy="48" r="2.5" fill="#FDE68A" style={{ animationDelay: '0.6s' }} />
        <circle className="first100-sparkle" cx="22" cy="160" r="2" fill="#FDE68A" style={{ animationDelay: '1.2s' }} />
        <circle className="first100-sparkle" cx="198" cy="155" r="2.5" fill="#FDE68A" style={{ animationDelay: '0.3s' }} />
        <circle className="first100-sparkle" cx="56" cy="28" r="1.5" fill="#FDE68A" style={{ animationDelay: '0.9s' }} />
        <circle className="first100-sparkle" cx="164" cy="24" r="1.5" fill="#FDE68A" style={{ animationDelay: '1.5s' }} />

        {/* Gold outer ring */}
        <circle cx="110" cy="105" r="90" fill="none" stroke="url(#first100GoldG)" strokeWidth="3" />
        <circle cx="110" cy="105" r="86" fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0.5" />

        {/* Purple half (left) */}
        <circle cx="110" cy="105" r="82" fill="#7C3AED" clipPath="url(#first100LeftH)" />
        {/* Green half (right) */}
        <circle cx="110" cy="105" r="82" fill="#205A40" clipPath="url(#first100RightH)" />

        {/* Pulsing center glow */}
        <circle className="first100-pulse-glow" cx="110" cy="105" r="50" fill="white" opacity="0.15" />

        {/* Center gold divider */}
        <line x1="110" y1="23" x2="110" y2="187" stroke="#FBBF24" strokeWidth="2" opacity="0.7" />

        {/* Decorative inner rings */}
        <circle cx="110" cy="105" r="74" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <circle cx="110" cy="105" r="70" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" strokeDasharray="4 3" />

        {/* Mini laurels inside (left - purple side) */}
        <g fill="#10B981" opacity="0.55">
          <ellipse cx="40" cy="78" rx="5" ry="9" transform="rotate(-28 40 78)" />
          <ellipse cx="36" cy="96" rx="5" ry="9" transform="rotate(-8 36 96)" />
          <ellipse cx="38" cy="114" rx="5" ry="9" transform="rotate(15 38 114)" />
          <ellipse cx="44" cy="130" rx="4" ry="7" transform="rotate(30 44 130)" />
        </g>
        {/* Mini laurels inside (right - green side) */}
        <g fill="#10B981" opacity="0.55">
          <ellipse cx="180" cy="78" rx="5" ry="9" transform="rotate(28 180 78)" />
          <ellipse cx="184" cy="96" rx="5" ry="9" transform="rotate(8 184 96)" />
          <ellipse cx="182" cy="114" rx="5" ry="9" transform="rotate(-15 182 114)" />
          <ellipse cx="176" cy="130" rx="4" ry="7" transform="rotate(-30 176 130)" />
        </g>

        {/* THE FIRST text */}
        <text x="110" y="52" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#FDE68A" letterSpacing="3">THE FIRST</text>

        {/* Jersey icon centered with pulse */}
        <g className="first100-jersey-pulse" transform="translate(0, 6)">
          <path d="M92 58H128L142 70V82L128 78V120C128 122.5 126 124.5 123 124.5H97C94 124.5 92 122.5 92 120V78L78 82V70L92 58Z" fill="#E9D5FF" opacity="0.9" />
          <path d="M96 62H124L136 72V78L124 75V120H96V75L84 78V72L96 62Z" fill="#C4B5FD" opacity="0.65" />
          <path d="M100 66H120L130 74V78L120 76V116H100V76L90 78V74L100 66Z" fill="white" opacity="0.2" />
          {/* 100 as jersey number */}
          <text x="110" y="100" textAnchor="middle" fontFamily="Georgia, serif" fontSize="26" fontWeight="700" fill="#FBBF24">100</text>
        </g>

        {/* EARLY ADOPTER text with pulse */}
        <text className="first100-adopt-pulse" x="110" y="152" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#FBBF24" letterSpacing="1.5">EARLY ADOPTER</text>
        {/* Decorative line accents flanking early adopter */}
        <line x1="52" y1="149" x2="72" y2="149" stroke="#FBBF24" strokeWidth="0.5" opacity="0.5" />
        <line x1="148" y1="149" x2="168" y2="149" stroke="#FBBF24" strokeWidth="0.5" opacity="0.5" />

        {/* Shimmer overlay */}
        <g clipPath="url(#first100DiscClip)">
          <rect x="0" y="0" width="220" height="220" fill="url(#first100ShimG)" opacity="0.5" />
        </g>

        {/* Twinkling side stars */}
        <g className="first100-star-twinkle" style={{ animationDelay: '0s' }}>
          <path d="M18 70L21 64L24 70L21 76Z" fill="#FBBF24" />
        </g>
        <g className="first100-star-twinkle" style={{ animationDelay: '0.7s' }}>
          <path d="M196 70L199 64L202 70L199 76Z" fill="#FBBF24" />
        </g>
        <g className="first100-star-twinkle" style={{ animationDelay: '1.4s' }}>
          <path d="M18 140L21 134L24 140L21 146Z" fill="#FBBF24" />
        </g>
        <g className="first100-star-twinkle" style={{ animationDelay: '0.35s' }}>
          <path d="M196 140L199 134L202 140L199 146Z" fill="#FBBF24" />
        </g>

        {/* Ring accent gems */}
        <circle cx="110" cy="13" r="4" fill="#FBBF24" />
        <circle cx="110" cy="13" r="2" fill="#FDE68A" />
        <circle cx="110" cy="197" r="4" fill="#FBBF24" />
        <circle cx="110" cy="197" r="2" fill="#FDE68A" />

        {/* Bottom ribbon with RECOLLECTKITS */}
        <g className="first100-ribbon">
          <path d="M30 192L56 184L56 210L30 218Z" fill="#205A40" />
          <path d="M190 192L164 184L164 210L190 218Z" fill="#6D28D9" />
          {/* Split ribbon: purple left, green right */}
          <rect x="56" y="184" width="54" height="22" fill="#9061F9" />
          <rect x="110" y="184" width="54" height="22" fill="#10B981" />
          {/* Inner ribbon */}
          <rect x="60" y="187" width="50" height="16" fill="#7C3AED" />
          <rect x="110" y="187" width="50" height="16" fill="#059669" />
        </g>
        <text x="110" y="199" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="700" fill="white" letterSpacing="1.8">RECOLLECTKITS</text>
        <circle cx="62" cy="195" r="2" fill="#FBBF24" />
        <circle cx="158" cy="195" r="2" fill="#FBBF24" />
      </svg>
    </div>
  );
};

// Small badge pill for profile headers, comments, etc.
export const First100Pill = () => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'linear-gradient(135deg, #7C3AED 0%, #205A40 100%)',
      padding: '6px 14px',
      borderRadius: '20px',
      border: '2px solid #F59E0B',
      boxShadow: '0 0 12px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    }}>
      <svg width="18" height="18" viewBox="0 0 220 220" fill="none">
        <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.95" />
        <line x1="110" y1="20" x2="110" y2="200" stroke="#FBBF24" strokeWidth="4" />
      </svg>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '1px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>
        THE FIRST 100
      </span>
    </div>
  );
};

// Profile avatar wrapper with animated dual-tone ring
export const First100Avatar = ({ initials = '??', imageSrc = null }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: imageSrc
          ? `url(${imageSrc})`
          : 'linear-gradient(135deg, #7C3AED 50%, #205A40 50%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '28px',
        color: 'white',
        border: '4px solid #F59E0B',
        boxShadow: '0 0 20px rgba(245,158,11,0.4)',
        animation: 'first100PulseGlow 3s ease-in-out infinite',
      }}>
        {!imageSrc && initials}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '32px',
        height: '32px',
        background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>100</span>
      </div>
    </div>
  );
};

export default First100Badge;
