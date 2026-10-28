'use client'

import Image from 'next/image'
import { useState } from 'react'

import { IconPin } from './icons'

/** The map loads only on request: no third-party request (or cookies) until the visitor asks. */
export function MapEmbed({ lat, lng, title, label }: { lat: number; lng: number; title: string; label: string }) {
  const [on, setOn] = useState(false)
  return (
    <div className="map">
      {on ? (
        <iframe
          title={title}
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="map__cover">
          <svg className="plan" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="400" height="500" fill="#1d1613" />
            <g fill="#261d19">
              <path d="M0 80L400 40V110L0 150z" />
              <path d="M0 300L400 260V320L0 360z" />
              <path d="M90 0h50l40 500h-50z" />
              <path d="M260 0h44l-20 500h-44z" />
            </g>
            <circle cx="200" cy="230" r="120" fill="none" stroke="#7a1013" strokeWidth="18" />
            <circle cx="200" cy="230" r="96" fill="#d9a35a" opacity="0.14" />
          </svg>
          <Image src="/brand/bull-520.webp" alt="" width={520} height={512} />
          <button type="button" className="btn btn--red" onClick={() => setOn(true)}>
            <IconPin /> {label}
          </button>
        </div>
      )}
    </div>
  )
}
