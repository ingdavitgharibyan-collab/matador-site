import config from '@payload-config'
import { getPayload } from 'payload'

import { handleUpdate } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

/** Telegram webhook. Telegram sends the secret set by scripts/telegram-setup.mjs; anything else is refused. */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) return new Response(null, { status: 401 })
  try {
    const payload = await getPayload({ config })
    await handleUpdate(await req.json(), payload)
  } catch (e) {
    console.error('telegram webhook', e)
  }
  // always 200 so Telegram does not retry a broken update forever
  return Response.json({ ok: true })
}
