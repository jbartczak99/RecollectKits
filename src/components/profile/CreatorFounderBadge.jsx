import React from 'react';

// CSS animations - add these to your global CSS or styled-components
export const badgeAnimationStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.6)); }
  50% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.9)); }
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
}

@keyframes ribbonWave {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.02); }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.creator-founder-badge-container {
  animation: float 4s ease-in-out infinite;
}

.creator-founder-badge-glow {
  animation: glow 2s ease-in-out infinite;
}

.creator-founder-crown {
  animation: crownFloat 3s ease-in-out infinite;
}

.creator-founder-rotating-ring {
  animation: rotate 20s linear infinite;
  transform-origin: center;
}

.creator-founder-star {
  animation: starTwinkle 2s ease-in-out infinite;
}

.creator-founder-ribbon {
  animation: ribbonWave 4s ease-in-out infinite;
  transform-origin: center;
}

.creator-founder-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

.creator-founder-shimmer {
  animation: shimmer 3s linear infinite;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
  background-size: 200% 100%;
}
`;

// Full-size badge for profile pages, about sections, etc.
export const CreatorFounderBadge = ({ size = 220 }) => {
  const scale = size / 220;
  
  return (
    <div className="creator-founder-badge-container" style={{ display: 'inline-block' }}>
      <svg 
        width={size} 
        height={size * (210/220)} 
        viewBox="0 0 220 210" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="creator-founder-badge-glow"
      >
        {/* Outer rotating decorative ring */}
        <g className="creator-founder-rotating-ring">
          <circle cx="110" cy="100" r="98" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="8 4"/>
          <circle cx="110" cy="2" r="3" fill="#FBBF24"/>
          <circle cx="110" cy="198" r="3" fill="#FBBF24"/>
          <circle cx="12" cy="100" r="3" fill="#FBBF24"/>
          <circle cx="208" cy="100" r="3" fill="#FBBF24"/>
        </g>

        {/* Animated sparkles */}
        <circle className="creator-founder-sparkle" cx="30" cy="40" r="2" fill="#FDE68A" style={{animationDelay: '0s'}}/>
        <circle className="creator-founder-sparkle" cx="190" cy="45" r="2.5" fill="#FDE68A" style={{animationDelay: '0.5s'}}/>
        <circle className="creator-founder-sparkle" cx="25" cy="150" r="2" fill="#FDE68A" style={{animationDelay: '1s'}}/>
        <circle className="creator-founder-sparkle" cx="195" cy="155" r="2.5" fill="#FDE68A" style={{animationDelay: '1.5s'}}/>
        <circle className="creator-founder-sparkle" cx="110" cy="12" r="2" fill="#FDE68A" style={{animationDelay: '0.3s'}}/>
        <circle className="creator-founder-sparkle" cx="55" cy="85" r="1.5" fill="#FDE68A" style={{animationDelay: '0.8s'}}/>
        <circle className="creator-founder-sparkle" cx="165" cy="90" r="1.5" fill="#FDE68A" style={{animationDelay: '1.3s'}}/>

        {/* Elaborate laurel wreath left */}
        <g fill="#10B981">
          <ellipse cx="22" cy="55" rx="8" ry="12" transform="rotate(-35 22 55)"/>
          <ellipse cx="16" cy="72" rx="8" ry="12" transform="rotate(-20 16 72)"/>
          <ellipse cx="14" cy="92" rx="8" ry="12" transform="rotate(-5 14 92)"/>
          <ellipse cx="16" cy="112" rx="8" ry="12" transform="rotate(10 16 112)"/>
          <ellipse cx="22" cy="130" rx="8" ry="12" transform="rotate(25 22 130)"/>
          <ellipse cx="32" cy="145" rx="7" ry="10" transform="rotate(40 32 145)"/>
        </g>
        <path d="M28 48C16 68 12 88 14 100C14 118 20 136 34 152" stroke="#205A40" strokeWidth="3" fill="none"/>
        <g fill="#059669">
          <ellipse cx="26" cy="62" rx="5" ry="8" transform="rotate(-30 26 62)"/>
          <ellipse cx="20" cy="82" rx="5" ry="8" transform="rotate(-10 20 82)"/>
          <ellipse cx="20" cy="102" rx="5" ry="8" transform="rotate(5 20 102)"/>
          <ellipse cx="24" cy="122" rx="5" ry="8" transform="rotate(20 24 122)"/>
        </g>

        {/* Elaborate laurel wreath right */}
        <g fill="#10B981">
          <ellipse cx="198" cy="55" rx="8" ry="12" transform="rotate(35 198 55)"/>
          <ellipse cx="204" cy="72" rx="8" ry="12" transform="rotate(20 204 72)"/>
          <ellipse cx="206" cy="92" rx="8" ry="12" transform="rotate(5 206 92)"/>
          <ellipse cx="204" cy="112" rx="8" ry="12" transform="rotate(-10 204 112)"/>
          <ellipse cx="198" cy="130" rx="8" ry="12" transform="rotate(-25 198 130)"/>
          <ellipse cx="188" cy="145" rx="7" ry="10" transform="rotate(-40 188 145)"/>
        </g>
        <path d="M192 48C204 68 208 88 206 100C206 118 200 136 186 152" stroke="#205A40" strokeWidth="3" fill="none"/>
        <g fill="#059669">
          <ellipse cx="194" cy="62" rx="5" ry="8" transform="rotate(30 194 62)"/>
          <ellipse cx="200" cy="82" rx="5" ry="8" transform="rotate(10 200 82)"/>
          <ellipse cx="200" cy="102" rx="5" ry="8" transform="rotate(-5 200 102)"/>
          <ellipse cx="196" cy="122" rx="5" ry="8" transform="rotate(-20 196 122)"/>
        </g>

        {/* Elaborate crown with jewels */}
        <g className="creator-founder-crown">
          <path d="M65 30L75 8L88 22L110 2L132 22L145 8L155 30" fill="url(#goldGrad)"/>
          <path d="M68 30L76 12L88 24L110 6L132 24L144 12L152 30" fill="#FBBF24"/>
          <path d="M72 28L78 16L88 26L110 10L132 26L142 16L148 28" fill="url(#goldGrad)"/>
          {/* Crown jewels */}
          <circle cx="75" cy="12" r="4" fill="#E11D48"/>
          <circle cx="75" cy="12" r="2" fill="#FB7185"/>
          <circle cx="110" cy="5" r="5" fill="#7C3AED"/>
          <circle cx="110" cy="5" r="2.5" fill="#A78BFA"/>
          <circle cx="145" cy="12" r="4" fill="#E11D48"/>
          <circle cx="145" cy="12" r="2" fill="#FB7185"/>
          {/* Crown details */}
          <rect x="85" y="24" width="50" height="4" rx="2" fill="#F59E0B"/>
          <circle cx="95" cy="26" r="2" fill="#FDE68A"/>
          <circle cx="110" cy="26" r="2" fill="#FDE68A"/>
          <circle cx="125" cy="26" r="2" fill="#FDE68A"/>
        </g>

        {/* Main shield with gradient */}
        <path d="M110 32L170 50V95C170 130 142 152 110 164C78 152 50 130 50 95V50L110 32Z" fill="url(#shieldGrad)"/>
        <path d="M110 36L166 52.5V95C166 127.5 140 148 110 159.5C80 148 54 127.5 54 95V52.5L110 36Z" fill="#9061F9"/>
        <path d="M110 40L162 55V95C162 125 138 144 110 155C82 144 58 125 58 95V55L110 40Z" fill="url(#shieldGrad)"/>

        {/* Inner decorative elements */}
        <path d="M110 48L152 60V95C152 120 132 136 110 146C88 136 68 120 68 95V60L110 48Z" fill="none" stroke="#E9D5FF" strokeWidth="2"/>
        <path d="M110 56L142 66V95C142 115 126 128 110 136C94 128 78 115 78 95V66L110 56Z" fill="#7C3AED"/>

        {/* Starburst behind jersey */}
        <path d="M110 65L118 85L140 80L124 95L140 110L118 105L110 125L102 105L80 110L96 95L80 80L102 85Z" fill="#C4B5FD" opacity="0.5"/>

        {/* Large jersey icon */}
        <path d="M90 70H130L142 80V92L130 88V128C130 131 127 134 124 134H96C93 134 90 131 90 128V88L78 92V80L90 70Z" fill="#E9D5FF"/>
        <path d="M94 74H126L136 82V88L126 85V130H94V85L84 88V82L94 74Z" fill="#C4B5FD"/>
        <path d="M98 78H122L130 84V88L122 86V126H98V86L90 88V84L98 78Z" fill="#7C3AED"/>

        {/* Creator text on jersey */}
        <text x="110" y="105" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" fill="#E9D5FF" letterSpacing="1">CREATOR</text>

        {/* Decorative side gems */}
        <g className="creator-founder-star" style={{animationDelay: '0s'}}>
          <path d="M58 68L61 74L68 75L63 80L64 87L58 84L52 87L53 80L48 75L55 74Z" fill="#FBBF24"/>
          <circle cx="58" cy="77" r="3" fill="#FDE68A"/>
        </g>
        <g className="creator-founder-star" style={{animationDelay: '0.5s'}}>
          <path d="M162 68L165 74L172 75L167 80L168 87L162 84L156 87L157 80L152 75L159 74Z" fill="#FBBF24"/>
          <circle cx="162" cy="77" r="3" fill="#FDE68A"/>
        </g>
        <g className="creator-founder-star" style={{animationDelay: '1s'}}>
          <path d="M70 115L72 119L76 119.5L73.5 122L74 126L70 124L66 126L66.5 122L64 119.5L68 119Z" fill="#FBBF24"/>
        </g>
        <g className="creator-founder-star" style={{animationDelay: '1.5s'}}>
          <path d="M150 115L152 119L156 119.5L153.5 122L154 126L150 124L146 126L146.5 122L144 119.5L148 119Z" fill="#FBBF24"/>
        </g>

        {/* Bottom ribbon banner */}
        <g className="creator-founder-ribbon">
          {/* Ribbon tails */}
          <path d="M25 168L45 160L45 182L25 190Z" fill="#205A40"/>
          <path d="M195 168L175 160L175 182L195 190Z" fill="#205A40"/>
          {/* Main ribbon body */}
          <rect x="45" y="160" width="130" height="22" fill="#10B981"/>
          {/* Inner highlight */}
          <rect x="50" y="164" width="120" height="14" fill="#059669"/>
        </g>

        {/* FOUNDER text */}
        <text x="110" y="176" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="700" fill="white" letterSpacing="2">FOUNDER</text>

        {/* Accent stars on ribbon ends */}
        <circle cx="55" cy="171" r="2.5" fill="#FBBF24"/>
        <circle cx="165" cy="171" r="2.5" fill="#FBBF24"/>

        {/* Year with decoration */}
        <text x="110" y="202" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="9" fill="#205A40" letterSpacing="2">✦ ESTABLISHED 2025 ✦</text>

        {/* Gradients */}
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A"/>
            <stop offset="50%" stopColor="#F59E0B"/>
            <stop offset="100%" stopColor="#FBBF24"/>
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9061F9"/>
            <stop offset="50%" stopColor="#7C3AED"/>
            <stop offset="100%" stopColor="#6D28D9"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Small badge pill for profile headers, comments, etc.
export const CreatorFounderPill = () => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'linear-gradient(135deg, #7C3AED 0%, #9061F9 30%, #7C3AED 70%, #6D28D9 100%)',
      padding: '6px 14px',
      borderRadius: '20px',
      border: '2px solid #F59E0B',
      boxShadow: '0 0 12px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    }}>
      <svg width="18" height="20" viewBox="0 0 220 200" fill="none">
        <path d="M110 32L170 50V95C170 130 142 152 110 164C78 152 50 130 50 95V50L110 32Z" fill="white" fillOpacity="0.95"/>
        <path d="M65 30L75 8L88 22L110 2L132 22L145 8L155 30" fill="#FBBF24"/>
      </svg>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '1px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>
        CREATOR & FOUNDER
      </span>
    </div>
  );
};

// Profile avatar wrapper with animated gold ring
export const CreatorFounderAvatar = ({ initials = 'JB', imageSrc = null }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: imageSrc ? `url(${imageSrc})` : 'linear-gradient(135deg, #7C3AED, #9061F9)',
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
        animation: 'pulse 3s ease-in-out infinite',
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default CreatorFounderBadge;
