'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Re-renders the server page every few seconds (order status), until it reaches a final state. */
export function AutoRefresh({ seconds, stop }: { seconds: number; stop?: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (stop) return
    const i = window.setInterval(() => router.refresh(), seconds * 1000)
    return () => window.clearInterval(i)
  }, [router, seconds, stop])
  return null
}
