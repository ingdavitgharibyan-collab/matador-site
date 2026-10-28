import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/** Uptime check: 200 when the app and the database answer, 503 otherwise. */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'categories' })
    return Response.json({ ok: true, at: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
