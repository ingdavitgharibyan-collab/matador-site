import type { CollectionConfig } from 'payload'

export const ART_KINDS = ['shawarma', 'plate', 'burger', 'skewer', 'ribs', 'fries', 'salad', 'drink', 'sauce'] as const

export const Dishes: CollectionConfig = {
  slug: 'dishes',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'price', 'available'] },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'ingredients', type: 'text', localized: true, admin: { description: 'Comma-separated' } },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'AMD' } },
        { name: 'weight', type: 'text', admin: { description: 'e.g. 350 g, 0.5 L' } },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'spicy', type: 'checkbox', defaultValue: false },
        { name: 'signature', type: 'checkbox', defaultValue: false, admin: { description: 'House favourite' } },
        { name: 'available', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Real photo of the dish; replaces the drawing' } },
    {
      name: 'art',
      type: 'select',
      defaultValue: 'burger',
      options: ART_KINDS.map((k) => ({ label: k, value: k })),
      admin: { description: 'Drawing used when there is no photo' },
    },
  ],
}
