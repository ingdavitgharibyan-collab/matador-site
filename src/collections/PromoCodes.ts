import type { CollectionConfig } from 'payload'

import { manager, staff } from '../access/roles'
import { L } from '../fields/labels'

export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',
  labels: { singular: L('Պրոմո կոդ', 'Промокод', 'Promo code'), plural: L('Պրոմո կոդեր', 'Промокоды', 'Promo codes') },
  admin: { useAsTitle: 'code', defaultColumns: ['code', 'kind', 'value', 'uses', 'active'] },
  access: { read: staff, create: manager, update: manager, delete: manager },
  hooks: {
    beforeValidate: [({ data }) => (data?.code ? { ...data, code: String(data.code).trim().toUpperCase() } : data)],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'code', label: L('Կոդ', 'Код', 'Code'), type: 'text', required: true, unique: true, index: true },
        { name: 'active', label: L('Ակտիվ', 'Активен', 'Active'), type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          label: L('Տեսակ', 'Тип', 'Kind'),
          type: 'select',
          required: true,
          defaultValue: 'percent',
          options: [
            { value: 'percent', label: L('Տոկոս', 'Процент', 'Percent') },
            { value: 'fixed', label: L('Գումար, ֏', 'Сумма, ֏', 'Amount, ֏') },
            { value: 'free_delivery', label: L('Անվճար առաքում', 'Бесплатная доставка', 'Free delivery') },
          ],
        },
        { name: 'value', label: L('Չափ', 'Размер', 'Value'), type: 'number', defaultValue: 10, min: 0 },
        { name: 'minOrder', label: L('Նվազագույն պատվեր, ֏', 'Мин. заказ, ֏', 'Minimum order, ֏'), type: 'number', defaultValue: 0, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'validFrom', label: L('Սկսած', 'С', 'From'), type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'validTo', label: L('Մինչև', 'По', 'To'), type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'maxUses', label: L('Առավելագույնը', 'Максимум использований', 'Max uses'), type: 'number', min: 0, admin: { description: L('Դատարկ՝ անսահմանափակ', 'Пусто — без ограничений', 'Empty = unlimited') } },
        { name: 'uses', label: L('Օգտագործվել է', 'Использован', 'Used'), type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
  ],
}
