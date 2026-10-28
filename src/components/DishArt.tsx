/*
 * Drawn stand-ins for dish photographs, in the logo's language: a red disc on black, the food in
 * gold, whitewash and oxblood. Replace each with a real photo in /admin (Dishes → Photo).
 */
const C = { n: '#120d0b', r: '#d0161e', b: '#7a1013', o: '#d4a84a', c: '#f4eee3', a: '#d9a35a', d: '#2a1f1a' }

const shapes: Record<string, React.ReactNode> = {
  shawarma: (
    <g transform="rotate(-28 60 64)">
      <path d="M44 30h32l-6 66a10 10 0 01-20 0z" fill={C.c} />
      <path d="M44 30c4-8 28-8 32 0-6 5-26 5-32 0z" fill={C.b} />
      <circle cx="52" cy="28" r="5" fill={C.r} />
      <circle cx="66" cy="27" r="4" fill={C.o} />
      <path d="M58 22c3-4 8-4 10 0" stroke={C.a} strokeWidth="4" fill="none" />
      <path d="M46 58h28l-1.8 20H47.8z" fill={C.n} />
      <path d="M50 64h20" stroke={C.o} strokeWidth="2" />
      <path d="M48 40l24 0M49 48h22" stroke={C.a} strokeWidth="2" strokeDasharray="3 4" />
    </g>
  ),
  plate: (
    <g>
      <ellipse cx="60" cy="70" rx="40" ry="22" fill={C.c} />
      <ellipse cx="60" cy="68" rx="30" ry="15" fill={C.a} />
      <path d="M38 66c6-8 18-10 24-4-6 6-18 8-24 4z" fill={C.b} />
      <path d="M58 60c8-6 20-4 24 4-8 4-18 4-24-4z" fill={C.n} />
      <g fill={C.o}>
        <rect x="62" y="70" width="4" height="14" transform="rotate(20 64 77)" />
        <rect x="68" y="69" width="4" height="14" transform="rotate(-12 70 76)" />
        <rect x="74" y="68" width="4" height="12" transform="rotate(30 76 74)" />
      </g>
      <circle cx="48" cy="74" r="4" fill={C.r} />
      <circle cx="44" cy="58" r="3" fill={C.c} />
    </g>
  ),
  burger: (
    <g>
      <path d="M28 56c0-20 64-20 64 0z" fill={C.o} />
      <g fill={C.c}>
        <ellipse cx="46" cy="44" rx="2" ry="1.2" />
        <ellipse cx="60" cy="40" rx="2" ry="1.2" />
        <ellipse cx="72" cy="45" rx="2" ry="1.2" />
      </g>
      <path d="M26 58h68l-4 5H30z" fill={C.b} />
      <path d="M30 63h60l-8 9-6-5-8 7-6-6-8 7-6-6-8 5z" fill={C.a} />
      <rect x="27" y="66" width="66" height="13" rx="6.5" fill={C.n} stroke={C.d} strokeWidth="2" />
      <path d="M28 84h64c0 8-6 12-12 12H40c-6 0-12-4-12-12z" fill={C.o} />
    </g>
  ),
  skewer: (
    <g transform="rotate(-35 60 60)">
      <rect x="8" y="58.5" width="104" height="3" fill={C.c} />
      <rect x="104" y="55" width="10" height="10" fill={C.o} />
      <rect x="22" y="48" width="18" height="24" rx="4" fill={C.b} />
      <rect x="44" y="50" width="8" height="20" rx="4" fill={C.c} />
      <rect x="56" y="47" width="18" height="26" rx="4" fill={C.n} stroke={C.d} strokeWidth="2" />
      <rect x="78" y="50" width="8" height="20" rx="4" fill={C.c} />
      <rect x="88" y="48" width="14" height="24" rx="4" fill={C.b} />
      <path d="M26 52h10M60 52h10M90 52h8" stroke={C.o} strokeWidth="2" />
    </g>
  ),
  ribs: (
    <g>
      <path d="M26 46c18-8 50-8 68 0v30c-18 8-50 8-68 0z" fill={C.b} />
      <path d="M30 50c16-6 44-6 60 0" stroke={C.n} strokeWidth="5" fill="none" />
      <g fill={C.c}>
        {[34, 46, 58, 70, 82].map((x) => (
          <g key={x}>
            <rect x={x} y="36" width="5" height="14" />
            <circle cx={x + 1} cy="35" r="3" />
            <circle cx={x + 4} cy="35" r="3" />
          </g>
        ))}
      </g>
      <path d="M32 62h56M34 70h52" stroke={C.o} strokeWidth="2" strokeDasharray="6 5" />
    </g>
  ),
  fries: (
    <g>
      <g fill={C.o}>
        {[40, 47, 54, 61, 68, 75].map((x, i) => (
          <rect key={x} x={x} y={28 + (i % 3) * 6} width="6" height="40" transform={`rotate(${(i - 2.5) * 4} ${x + 3} 70)`} />
        ))}
      </g>
      <path d="M34 54h52l-6 42H40z" fill={C.r} />
      <path d="M34 54h52" stroke={C.c} strokeWidth="3" />
      <path d="M52 70c4 6 12 6 16 0" stroke={C.c} strokeWidth="3" fill="none" />
    </g>
  ),
  salad: (
    <g>
      <circle cx="48" cy="56" r="9" fill={C.r} />
      <circle cx="66" cy="52" r="8" fill={C.r} />
      <circle cx="58" cy="62" r="8" fill={C.c} />
      <circle cx="58" cy="62" r="4" fill={C.a} />
      <circle cx="76" cy="62" r="7" fill={C.c} />
      <path d="M40 46c4-6 10-6 12 0M68 42c4-6 10-4 10 2" stroke={C.o} strokeWidth="3" fill="none" />
      <path d="M26 62h68c0 18-14 30-34 30S26 80 26 62z" fill={C.n} stroke={C.d} strokeWidth="2" />
      <path d="M34 70h52" stroke={C.o} strokeWidth="2" />
    </g>
  ),
  drink: (
    <g>
      <path d="M52 22h16v14c8 6 10 12 10 20v38a4 4 0 01-4 4H46a4 4 0 01-4-4V56c0-8 2-14 10-20z" fill={C.n} stroke={C.d} strokeWidth="2" />
      <rect x="50" y="16" width="20" height="8" fill={C.o} />
      <rect x="42" y="60" width="36" height="22" fill={C.c} />
      <path d="M46 66h28M46 72h20" stroke={C.r} strokeWidth="3" />
      <circle cx="84" cy="34" r="3" fill={C.c} />
      <circle cx="90" cy="46" r="2" fill={C.c} />
    </g>
  ),
  sauce: (
    <g>
      <ellipse cx="60" cy="58" rx="28" ry="9" fill={C.r} />
      <path d="M32 58h56l-6 30a6 6 0 01-6 5H44a6 6 0 01-6-5z" fill={C.c} />
      <path d="M48 52c6-6 16-6 22 0" stroke={C.b} strokeWidth="4" fill="none" />
      <path d="M38 72h44" stroke={C.o} strokeWidth="3" />
    </g>
  ),
}

export function DishArt({ kind, title }: { kind: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect width="120" height="120" fill={C.n} />
      <circle cx="60" cy="62" r="44" fill={C.r} opacity="0.9" />
      <circle cx="60" cy="62" r="44" fill="none" stroke={C.o} strokeWidth="1.5" />
      {shapes[kind] ?? shapes.burger}
    </svg>
  )
}
