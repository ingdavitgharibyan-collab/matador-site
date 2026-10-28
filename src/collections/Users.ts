import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: {
    // per-account lockout; the per-IP throttle lives in src/proxy.ts
    maxLoginAttempts: 8,
    lockTime: 5 * 60_000,
    tokenExpiration: 7 * 24 * 3600,
    cookies: { secure: process.env.NODE_ENV === 'production' && (process.env.NEXT_PUBLIC_SERVER_URL ?? '').startsWith('https://'), sameSite: 'Lax' },
  },
  fields: [],
}
