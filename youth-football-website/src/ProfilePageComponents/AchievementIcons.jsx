// Custom SVG Achievement Icons — Duolingo-inspired flat vector style
// Each icon is 60x60, clean paths, minimal detail

export function WildfireIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="fire-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>
      </defs>
      <path
        d="M30 6c0 0-4 8-4 14c0 4 2 6 4 8c-3-1-6-4-8-8c-2 6 0 14 8 20c8 6 14 4 16-2c2-6-2-14-6-18c0 4-2 6-4 6c0-6-2-12-6-20z"
        fill="url(#fire-grad)"
      />
      <path
        d="M30 28c0 0-2 4-2 8c0 4 2 8 4 10c2-2 4-6 4-10c0-4-3-6-6-8z"
        fill="#FFAB40"
        opacity="0.8"
      />
    </svg>
  );
}

export function SageIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="sage-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      <path
        d="M30 8c-8 0-14 6-14 14c0 5 3 10 7 12v4h14v-4c4-2 7-7 7-12c0-8-6-14-14-14z"
        fill="url(#sage-grad)"
      />
      <rect x="23" y="40" width="14" height="4" rx="2" fill="#FFA000" />
      <rect x="25" y="46" width="10" height="3" rx="1.5" fill="#FF8F00" />
      <line x1="30" y1="18" x2="30" y2="28" stroke="#FFF8E1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="36" y2="24" stroke="#FFF8E1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChampionIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="champ-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#F9A825" />
        </linearGradient>
      </defs>
      <path
        d="M16 12h28v8c0 10-6 18-14 20c-8-2-14-10-14-20v-8z"
        fill="url(#champ-grad)"
      />
      <path d="M16 12h-4c0 8 2 12 6 14c-2-4-2-8-2-14z" fill="#FFA000" />
      <path d="M44 12h4c0 8-2 12-6 14c2-4 2-8 2-14z" fill="#FFA000" />
      <rect x="26" y="40" width="8" height="6" fill="#FFA000" />
      <rect x="22" y="46" width="16" height="4" rx="2" fill="#F57F17" />
      <circle cx="30" cy="24" r="5" fill="#FFF8E1" opacity="0.4" />
    </svg>
  );
}

export function FirstStepsIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="steps-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
      </defs>
      <ellipse cx="22" cy="20" rx="6" ry="10" fill="url(#steps-grad)" transform="rotate(-15 22 20)" />
      <circle cx="18" cy="10" r="2.5" fill="#CD7F32" />
      <circle cx="22" cy="8" r="2" fill="#CD7F32" />
      <circle cx="26" cy="9" r="2" fill="#CD7F32" />
      <ellipse cx="38" cy="36" rx="6" ry="10" fill="url(#steps-grad)" transform="rotate(-15 38 36)" />
      <circle cx="34" cy="26" r="2.5" fill="#CD7F32" />
      <circle cx="38" cy="24" r="2" fill="#CD7F32" />
      <circle cx="42" cy="25" r="2" fill="#CD7F32" />
    </svg>
  );
}

export function TeamPlayerIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="team-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      <path
        d="M10 32c4-4 8-6 12-6c2 0 3 1 4 2l4 4l4-4c1-1 2-2 4-2c4 0 8 2 12 6"
        stroke="url(#team-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 28c0 0-2 4-2 6c0 2 2 4 4 4c1 0 2-1 3-2"
        fill="#C0C0C0"
      />
      <path
        d="M38 28c0 0 2 4 2 6c0 2-2 4-4 4c-1 0-2-1-3-2"
        fill="#C0C0C0"
      />
      <circle cx="30" cy="34" r="3" fill="#A0A0A0" />
    </svg>
  );
}

export function GoalMachineIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="goal-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      {/* Net */}
      <rect x="10" y="14" width="40" height="32" rx="2" stroke="#888" strokeWidth="2" fill="none" />
      <line x1="10" y1="22" x2="50" y2="22" stroke="#888" strokeWidth="1" opacity="0.5" />
      <line x1="10" y1="30" x2="50" y2="30" stroke="#888" strokeWidth="1" opacity="0.5" />
      <line x1="10" y1="38" x2="50" y2="38" stroke="#888" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="14" x2="20" y2="46" stroke="#888" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="14" x2="30" y2="46" stroke="#888" strokeWidth="1" opacity="0.5" />
      <line x1="40" y1="14" x2="40" y2="46" stroke="#888" strokeWidth="1" opacity="0.5" />
      {/* Ball */}
      <circle cx="30" cy="30" r="9" fill="url(#goal-grad)" />
      <path d="M30 21l3 5h-6l3-5z M24 27l-2 6 5-2-3-4z M36 27l2 6-5-2 3-4z M24 35l-1 5 5-1-4-4z M36 35l1 5-5-1 4-4z" fill="#FFF8E1" opacity="0.3" />
    </svg>
  );
}

export function IronManIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="iron-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#616161" />
        </linearGradient>
      </defs>
      <path
        d="M30 8L12 20v16c0 10 8 16 18 18c10-2 18-8 18-18V20L30 8z"
        fill="url(#iron-grad)"
      />
      <path
        d="M30 12L16 22v14c0 8 6 13 14 15c8-2 14-7 14-15V22L30 12z"
        fill="#757575"
        opacity="0.5"
      />
      <path d="M26 28l4 4 8-8" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RisingStarIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="star-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>
      <path
        d="M30 6l7 14.5L52 23l-11 10.7 2.6 15.3L30 42l-13.6 7 2.6-15.3L8 23l15-2.5L30 6z"
        fill="url(#star-grad)"
      />
      <path
        d="M30 14l4.5 9.3 10.2 1.5-7.4 7.2 1.7 10.3L30 37.5l-9 4.8 1.7-10.3-7.4-7.2 10.2-1.5L30 14z"
        fill="#FFF8E1"
        opacity="0.3"
      />
    </svg>
  );
}

export function StreakIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} width="60" height="60" fill="none">
      <defs>
        <linearGradient id="streak-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#F57C00" />
        </linearGradient>
      </defs>
      <path
        d="M34 6L20 30h10L18 54l24-28H30L42 6H34z"
        fill="url(#streak-grad)"
      />
      <path
        d="M32 12L22 30h8L20 48l18-22H28L36 12H32z"
        fill="#FFCC02"
        opacity="0.4"
      />
    </svg>
  );
}

// Map for easy lookup
export const ACHIEVEMENT_ICONS = {
  wildfire: WildfireIcon,
  sage: SageIcon,
  champion: ChampionIcon,
  firstSteps: FirstStepsIcon,
  teamPlayer: TeamPlayerIcon,
  goalMachine: GoalMachineIcon,
  ironMan: IronManIcon,
  risingStar: RisingStarIcon,
  streak: StreakIcon,
};
