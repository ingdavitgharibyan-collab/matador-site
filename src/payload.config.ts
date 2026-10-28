import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { Users } from './collections/Users'
import { migrations } from './migrations'
import { Settings } from './globals/Settings'
import { seedIfEmpty } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Matador admin' },
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
  collections: [Categories, Dishes, Media, Users],
  globals: [Settings],
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./matador.db' },
    // production applies committed migrations on boot; after a schema change run `npm run payload migrate:create`
    prodMigrations: migrations,
  }),
  sharp,
  onInit: async (payload) => {
    await seedIfEmpty(payload)
  },
})
