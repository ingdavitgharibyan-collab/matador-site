import type { GlobalConfig } from 'payload'

import { revalidateAfterChange } from '../hooks/revalidate'

import { TIME_RE } from '../lib/hours'

const time = (value: unknown) =>
  typeof value === 'string' && TIME_RE.test(value) ? true : 'HH:MM, 24-hour (e.g. 11:00, 02:00)'

export const PAYMENT_METHODS = ['cash', 'card_courier', 'idram', 'telcell', 'transfer'] as const

export const Settings: GlobalConfig = {
  slug: 'settings',
  hooks: { afterChange: [revalidateAfterChange] },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacts',
          fields: [
            { name: 'phone', type: 'text', required: true, admin: { description: 'International format, +374…' } },
            {
              name: 'whatsapp',
              type: 'text',
              admin: { description: 'Digits only, e.g. 37499123456' },
              validate: (v: unknown) => !v || /^\d{8,15}$/.test(String(v)) || 'Digits only, 8–15 (e.g. 37499123456)',
            },
            {
              name: 'telegram',
              type: 'text',
              admin: { description: 'Username without @' },
              validate: (v: unknown) => !v || /^[A-Za-z0-9_]{5,32}$/.test(String(v)) || 'Telegram username, 5–32 letters/digits/_',
            },
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
              admin: {
                isSortable: false,
                description:
                  'Rows are Monday → Sunday. Closing after midnight is fine (11:00 → 02:00). Same open and close time = open 24 h.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'open', type: 'text', defaultValue: '11:00', validate: time },
                    { name: 'close', type: 'text', defaultValue: '02:00', validate: time },
                    { name: 'closed', type: 'checkbox', defaultValue: false },
                  ],
                },
              ],
            },
            {
              name: 'closures',
              type: 'array',
              admin: { description: 'Holidays and one-off closures. The site shows "closed" and blocks orders on these days.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'from', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
                    { name: 'to', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
                  ],
                },
                { name: 'note', type: 'text', localized: true, admin: { description: 'Shown to guests, e.g. "Closed for New Year"' } },
              ],
            },
          ],
        },
        {
          label: 'Ordering',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'ordersPaused',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Stop taking orders right now (kitchen overloaded, outage). Calls stay possible.' },
                },
                {
                  name: 'lastOrderMinutes',
                  type: 'number',
                  defaultValue: 30,
                  min: 0,
                  max: 180,
                  admin: { description: 'Stop taking orders this many minutes before closing' },
                },
              ],
            },
            { name: 'pauseNote', type: 'text', localized: true, admin: { description: 'Optional reason shown while paused' } },
            {
              name: 'paymentMethods',
              type: 'select',
              hasMany: true,
              defaultValue: ['cash', 'card_courier'],
              options: [
                { label: 'Cash', value: 'cash' },
                { label: 'Card to the courier', value: 'card_courier' },
                { label: 'Idram', value: 'idram' },
                { label: 'Telcell', value: 'telcell' },
                { label: 'Bank transfer', value: 'transfer' },
              ],
            },
            { name: 'deliveryFee', type: 'number', defaultValue: 0, admin: { description: 'AMD, 0 = free' } },
            { name: 'freeDeliveryFrom', type: 'number', admin: { description: 'AMD' } },
            {
              name: 'partners',
              type: 'array',
              admin: { description: "Delivery services: paste Matador's own store page, not the service's home page" },
              fields: [
                { name: 'name', type: 'text', required: true },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  validate: (v: unknown) => {
                    try {
                      const u = new URL(String(v))
                      return (u.protocol === 'https:' && u.pathname.replace(/\/$/, '').split('/').length > 2) || 'Use the full https link to the Matador page on that service'
                    } catch {
                      return 'Use the full https link to the Matador page on that service'
                    }
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
