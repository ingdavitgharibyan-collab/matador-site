import type { CollectionConfig } from 'payload'

import { owner, staff } from '../access/roles'
import { L } from '../fields/labels'
import { notifyStatus } from '../lib/telegram'

export const ORDER_STATUSES = ['new', 'accepted', 'cooking', 'ready', 'out', 'delivered', 'cancelled', 'rejected'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export const STATUS_LABELS: Record<OrderStatus, ReturnType<typeof L>> = {
  new: L('Նոր', 'Новый', 'New'),
  accepted: L('Ընդունված', 'Принят', 'Accepted'),
  cooking: L('Պատրաստվում է', 'Готовится', 'Cooking'),
  ready: L('Պատրաստ է', 'Готов', 'Ready'),
  out: L('Ճանապարհին', 'В пути', 'Out for delivery'),
  delivered: L('Հանձնված', 'Выдан', 'Delivered'),
  cancelled: L('Չեղարկված', 'Отменён', 'Cancelled'),
  rejected: L('Մերժված', 'Отклонён', 'Rejected'),
}

/**
 * Every order sent from the site, with the prices the server computed (the chat text can be edited by the
 * guest; this record cannot). Created only by the placeOrder server action; staff read and move statuses.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: L('Պատվեր', 'Заказ', 'Order'), plural: L('Պատվերներ', 'Заказы', 'Orders') },
  admin: {
    useAsTitle: 'ref',
    defaultColumns: ['ref', 'status', 'total', 'mode', 'phone', 'createdAt'],
    listSearchableFields: ['ref', 'phone', 'name'],
  },
  access: { create: () => false, read: staff, update: staff, delete: owner },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (originalDoc && data.status && data.status !== originalDoc.status) {
          data.statusLog = [
            ...(originalDoc.statusLog ?? []),
            { status: data.status, at: new Date().toISOString(), by: (req.user as { email?: string } | null)?.email ?? 'telegram' },
          ]
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        if (operation === 'update' && previousDoc?.status !== doc.status) await notifyStatus(doc).catch(() => {})
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'ref', label: L('Համար', 'Номер', 'Ref'), type: 'text', required: true, unique: true, admin: { readOnly: true } },
        {
          name: 'status',
          label: L('Կարգավիճակ', 'Статус', 'Status'),
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        },
        { name: 'total', label: L('Ընդամենը, ֏', 'Итого, ֏', 'Total, ֏'), type: 'number', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mode',
          label: L('Ինչպես', 'Как', 'How'),
          type: 'select',
          required: true,
          options: [
            { value: 'delivery', label: L('Առաքում', 'Доставка', 'Delivery') },
            { value: 'pickup', label: L('Կվերցնի ինքը', 'Самовывоз', 'Pickup') },
            { value: 'table', label: L('Սեղան', 'Стол', 'Table') },
          ],
          admin: { readOnly: true },
        },
        { name: 'table', label: L('Սեղան', 'Стол', 'Table'), type: 'text', admin: { readOnly: true } },
        { name: 'zone', label: L('Զոնա', 'Зона', 'Zone'), type: 'text', admin: { readOnly: true } },
        { name: 'payment', label: L('Վճարում', 'Оплата', 'Payment'), type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', label: L('Անուն', 'Имя', 'Name'), type: 'text', admin: { readOnly: true } },
        { name: 'phone', label: L('Հեռախոս', 'Телефон', 'Phone'), type: 'text', index: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'address', label: L('Հասցե', 'Адрес', 'Address'), type: 'text', admin: { readOnly: true } },
        { name: 'flat', label: L('Բնակարան, մուտք, հարկ', 'Квартира, подъезд, этаж', 'Flat, entrance, floor'), type: 'text', admin: { readOnly: true } },
      ],
    },
    { name: 'note', label: L('Մեկնաբանություն', 'Комментарий', 'Note'), type: 'textarea', admin: { readOnly: true } },
    {
      name: 'lines',
      label: L('Ուտեստներ', 'Блюда', 'Dishes'),
      type: 'array',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'qty', label: '×', type: 'number' },
            { name: 'label', label: L('Ուտեստ', 'Блюдо', 'Dish'), type: 'text' },
            { name: 'unit', label: L('Գին', 'Цена', 'Price'), type: 'number' },
            { name: 'dish', type: 'text', admin: { hidden: true } },
            { name: 'opts', type: 'json', admin: { hidden: true } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', label: L('Ուտեստներ, ֏', 'Блюда, ֏', 'Dishes, ֏'), type: 'number', admin: { readOnly: true } },
        { name: 'fee', label: L('Առաքում, ֏', 'Доставка, ֏', 'Delivery, ֏'), type: 'number', admin: { readOnly: true } },
        { name: 'discount', label: L('Զեղչ, ֏', 'Скидка, ֏', 'Discount, ֏'), type: 'number', admin: { readOnly: true } },
        { name: 'promo', label: L('Պրոմո կոդ', 'Промокод', 'Promo code'), type: 'text', admin: { readOnly: true } },
        { name: 'channel', label: L('Ալիք', 'Канал', 'Channel'), type: 'text', admin: { readOnly: true } },
        { name: 'lang', label: L('Լեզու', 'Язык', 'Language'), type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'statusLog',
      label: L('Պատմություն', 'История', 'History'),
      type: 'array',
      admin: { readOnly: true, initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'status', type: 'text' },
            { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'by', type: 'text' },
          ],
        },
      ],
    },
    { name: 'token', type: 'text', index: true, admin: { hidden: true } },
    { name: 'kitchenMessageId', type: 'text', admin: { hidden: true } },
    { name: 'ipHash', type: 'text', admin: { hidden: true } },
  ],
}
