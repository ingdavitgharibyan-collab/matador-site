import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'slug'] },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
