import type { CollectionConfig } from 'payload'

import { manager } from '../access/roles'
import { L } from '../fields/labels'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  labels: { singular: L('Լուսանկար', 'Фото', 'Photo'), plural: L('Լուսանկարներ', 'Фото', 'Photos') },
  access: { read: () => true, create: manager, update: manager, delete: manager },
  upload: {
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    // phone photos arrive at 4000–6000 px; keep a 2000 px WebP original, never the raw file
    resizeOptions: { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'card', width: 800, height: 800, position: 'centre', formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'wide', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: L('Ինչ է նկարում (հասանելիության համար)', 'Что на фото (для доступности)', 'What is in the photo (for accessibility)'),
      type: 'text',
      localized: true,
      required: true,
    },
  ],
}
