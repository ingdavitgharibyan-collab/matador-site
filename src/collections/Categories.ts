import { APIError, type CollectionConfig } from 'payload'

import { manager } from '../access/roles'
import { L } from '../fields/labels'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: L('Կատեգորիա', 'Категория', 'Category'), plural: L('Կատեգորիաներ', 'Категории', 'Categories') },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    // a category with dishes cannot vanish under them: say what to do instead of a 500
    beforeDelete: [
      async ({ req, id }) => {
        const { totalDocs } = await req.payload.count({ collection: 'dishes', where: { category: { equals: id } }, req })
        if (totalDocs > 0) {
          throw new APIError(
            `Move or delete the ${totalDocs} dishes of this category first. / Սկզբում տեղափոխեք կամ ջնջեք այս կատեգորիայի ${totalDocs} ուտեստները։`,
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'slug'] },
  access: { read: () => true, create: manager, update: manager, delete: manager },
  defaultSort: 'order',
  fields: [
    { name: 'name', label: L('Անուն', 'Название', 'Name'), type: 'text', localized: true, required: true },
    {
      name: 'slug',
      label: L('Հասցե (լատինատառ)', 'Адрес (латиницей)', 'Slug'),
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: L('Օրինակ՝ shawarma, drinks', 'Например: shawarma, drinks', 'e.g. shawarma, drinks') },
    },
    { name: 'tagline', label: L('Ենթավերնագիր', 'Подзаголовок', 'Tagline'), type: 'text', localized: true },
    {
      name: 'order',
      label: L('Հերթականություն', 'Порядок', 'Order'),
      type: 'number',
      defaultValue: 0,
      admin: { description: L('Փոքր թիվը՝ վերևում', 'Меньше — выше', 'Smaller shows first') },
    },
  ],
}
