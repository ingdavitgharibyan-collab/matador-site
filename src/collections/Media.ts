import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 800, height: 800, position: 'centre' },
      { name: 'wide', width: 1600 },
    ],
  },
  fields: [{ name: 'alt', type: 'text', localized: true, required: true }],
}
