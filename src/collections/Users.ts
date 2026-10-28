import type { CollectionConfig } from 'payload'

import { isOwnerField, owner, ROLES, staff } from '../access/roles'
import { L } from '../fields/labels'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: L('Աշխատակից', 'Сотрудник', 'Staff member'), plural: L('Աշխատակիցներ', 'Сотрудники', 'Staff') },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'role'] },
  auth: {
    // per-account lockout; the per-IP throttle lives in src/proxy.ts
    maxLoginAttempts: 8,
    lockTime: 5 * 60_000,
    tokenExpiration: 7 * 24 * 3600,
    cookies: {
      secure: process.env.NODE_ENV === 'production' && (process.env.NEXT_PUBLIC_SERVER_URL ?? '').startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  access: {
    read: staff,
    create: owner,
    delete: owner,
    // everyone may change their own password; only the owner edits others
    update: ({ req, id }) => Boolean(req.user) && ((req.user as { role?: string }).role === 'owner' || req.user?.id === id),
  },
  fields: [
    {
      name: 'role',
      label: L('Դեր', 'Роль', 'Role'),
      type: 'select',
      required: true,
      defaultValue: 'owner',
      saveToJWT: true,
      access: { update: isOwnerField },
      options: [
        { label: L('Սեփականատեր', 'Владелец', 'Owner'), value: ROLES[0] },
        { label: L('Մենեջեր (մենյու)', 'Менеджер (меню)', 'Manager (menu)'), value: ROLES[1] },
        { label: L('Խոհանոց (stop-list, պատվերներ)', 'Кухня (стоп-лист, заказы)', 'Kitchen (stop-list, orders)'), value: ROLES[2] },
      ],
    },
  ],
}
