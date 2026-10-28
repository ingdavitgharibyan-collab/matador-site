/* One stroke family, 2px at 24px, square caps to match the square buttons. */
type P = { className?: string }
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
}

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconMinus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
)
export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconPhone = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z" />
  </svg>
)
export const IconTicket = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 6h18v4a2 2 0 000 4v4H3v-4a2 2 0 000-4z" />
    <path d="M14 6v2M14 11v2M14 16v2" />
  </svg>
)
export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
export const IconWhatsapp = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-3.8-1z" />
    <path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z" strokeWidth={1.5} />
  </svg>
)
export const IconTelegram = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 4L3 11l6 2 2 6 3-4 5 4z" />
    <path d="M9 13l8-6" />
  </svg>
)
export const IconChili = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 7c3 1 4 4 3 7-1.5 4-6 6-12 6 4-2 6-5 6-9 0-2 1-4 3-4z" />
    <path d="M15 7c0-2 1-3 3-4" />
  </svg>
)
export const IconStar = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
  </svg>
)
export const IconPin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
    <path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
  </svg>
)
