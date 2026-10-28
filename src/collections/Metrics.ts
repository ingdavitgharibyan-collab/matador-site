import type { CollectionConfig } from 'payload'

import { staff } from '../access/roles'
import { L } from '../fields/labels'

/** One row per business day of anonymous counters (no cookies, no IPs, no people): the ordering funnel. */
export const Metrics: CollectionConfig = {
  slug: 'metrics',
  labels: { singular: L('Վիճակագրություն', 'Статистика', 'Statistics'), plural: L('Վիճակագրություն', 'Статистика', 'Statistics') },
  admin: { useAsTitle: 'day', defaultColumns: ['day', 'updatedAt'], hidden: ({ user }) => !user },
  access: { read: staff, create: () => false, update: () => false, delete: () => false },
  defaultSort: '-day',
  fields: [
    { name: 'day', label: L('Օր', 'День', 'Day'), type: 'text', required: true, unique: true, index: true },
    { name: 'counts', label: L('Թվեր', 'Счётчики', 'Counts'), type: 'json', required: true },
  ],
}
