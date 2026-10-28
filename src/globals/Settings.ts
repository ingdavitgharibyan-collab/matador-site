import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacts',
          fields: [
            { name: 'phone', type: 'text', required: true, admin: { description: 'International format, +374…' } },
            { name: 'whatsapp', type: 'text', admin: { description: 'Digits only, e.g. 37499123456' } },
            { name: 'telegram', type: 'text', admin: { description: 'Username without @' } },
            { name: 'instagram', type: 'text' },
            { name: 'facebook', type: 'text' },
            { name: 'address', type: 'text', localized: true, required: true },
            {
              type: 'row',
              fields: [
                { name: 'lat', type: 'number', required: true },
                { name: 'lng', type: 'number', required: true },
              ],
            },
          ],
        },
        {
          label: 'Hours',
          fields: [
            {
              name: 'hours',
              type: 'array',
              minRows: 7,
              maxRows: 7,
              admin: { description: 'Monday first. Closing after midnight is fine (e.g. 11:00 → 02:00).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'open', type: 'text', defaultValue: '11:00' },
                    { name: 'close', type: 'text', defaultValue: '02:00' },
                    { name: 'closed', type: 'checkbox', defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Ordering',
          fields: [
            { name: 'deliveryFee', type: 'number', defaultValue: 0, admin: { description: 'AMD, 0 = free' } },
            { name: 'freeDeliveryFrom', type: 'number', admin: { description: 'AMD' } },
            {
              name: 'partners',
              type: 'array',
              admin: { description: 'Delivery services (Yandex Eats, Wolt, Glovo, Menu.am…)' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
