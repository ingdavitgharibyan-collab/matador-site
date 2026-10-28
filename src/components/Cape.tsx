import { forwardRef } from 'react'

/** The muleta: a red cloth with a rippled leading edge, swept across a surface to change it. */
export const Cape = forwardRef<HTMLDivElement, { page?: boolean }>(function Cape({ page }, ref) {
  return (
    <div ref={ref} className={page ? 'cape cape--page' : 'cape'} aria-hidden="true">
      <svg viewBox="0 0 240 100" preserveAspectRatio="none">
        <path
          d="M0 0H196C206 8 214 4 222 12C216 24 232 30 226 42C220 54 236 60 230 72C224 84 238 90 232 100H0Z"
          fill="currentColor"
        />
        <path
          d="M150 0C160 30 146 60 162 100M110 0C122 34 104 66 118 100M182 0C190 26 178 64 194 100"
          stroke="#7a1013"
          strokeWidth="5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          opacity="0.55"
        />
      </svg>
    </div>
  )
})
