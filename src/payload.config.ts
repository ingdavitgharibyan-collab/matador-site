import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { en } from '@payloadcms/translations/languages/en'
import { hy } from '@payloadcms/translations/languages/hy'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Dishes } from './collections/Dishes'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Users } from './collections/Users'
import { migrations } from './migrations'
import { Settings } from './globals/Settings'
import { ensureAdmin, seedIfEmpty } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || ''
/** Hosts the admin may be used from: the canonical one plus optional aliases (comma-separated). */
const origins = [serverURL, ...(process.env.SERVER_ALIASES ?? '').split(',')].map((s) => s.trim()).filter(Boolean)

/** Password-reset emails need SMTP; without it Payload only logs the attempt. */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM || 'no-reply@matador.am',
      defaultFromName: 'Matador',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  serverURL,
  csrf: origins,
  cors: origins,
  email,
  upload: { limits: { fileSize: 10_000_000 } },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Matador admin' },
    // no gravatar requests from the admin
    avatar: 'default',
    components: { beforeDashboard: ['/components/admin/TodayPanel#TodayPanel'] },
  },
  i18n: {
    supportedLanguages: { hy, ru, en },
    fallbackLanguage: 'hy',
  },
  localization: {
    locales: [
      { code: 'hy', label: 'Հայերեն' },
      { code: 'ru', label: 'Русский' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'hy',
    fallback: true,
  },
  collections: [Orders, Dishes, Categories, Media, Users],
  globals: [Settings],
  graphQL: { disable: true },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./matador.db' },
    // production applies committed migrations on boot; after a schema change run `npm run payload migrate:create`
    prodMigrations: migrations,
  }),
  sharp,
  onInit: async (payload) => {
    await ensureAdmin(payload)
    await seedIfEmpty(payload)
  },
})
