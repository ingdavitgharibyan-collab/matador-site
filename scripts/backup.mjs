// Nightly backup: a consistent SQLite snapshot (VACUUM INTO, safe while the site runs) + the media folder.
// Usage: node scripts/backup.mjs [targetDir]   (cron: 15 4 * * *)   Keeps the last BACKUP_KEEP (default 14).
// Copy the target folder off the server (rclone/rsync to B2/S3) — a backup on the same disk is not a backup.
import { createClient } from '@libsql/client'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const dbUrl = process.env.DATABASE_URI || 'file:./matador.db'
const mediaDir = process.env.MEDIA_DIR || 'media'
const target = path.resolve(process.argv[2] || process.env.BACKUP_DIR || 'backups')
const keep = Number(process.env.BACKUP_KEEP || 14)
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16)
const dir = path.join(target, stamp)
fs.mkdirSync(dir, { recursive: true })

const db = createClient({ url: dbUrl })
const snapshot = path.join(dir, 'matador.db')
await db.execute({ sql: 'VACUUM INTO ?', args: [snapshot] })
db.close()

if (fs.existsSync(mediaDir)) {
  execFileSync('tar', ['-czf', path.join(dir, 'media.tgz'), '-C', path.dirname(path.resolve(mediaDir)), path.basename(mediaDir)])
}

const all = fs.readdirSync(target).filter((d) => /^\d{4}-/.test(d)).sort()
for (const old of all.slice(0, Math.max(0, all.length - keep))) fs.rmSync(path.join(target, old), { recursive: true, force: true })
console.log(`backup ok: ${dir}`)
