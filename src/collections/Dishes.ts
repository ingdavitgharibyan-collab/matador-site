import type { CollectionConfig, Field } from 'payload'

import { manager, notKitchen, staff } from '../access/roles'
import { L, lockFields } from '../fields/labels'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const ART_KINDS = ['shawarma', 'plate', 'burger', 'skewer', 'ribs', 'fries', 'salad', 'drink', 'sauce'] as const
export const ALLERGENS = ['gluten', 'milk', 'egg', 'sesame', 'mustard', 'nuts', 'soy', 'celery'] as const
const ALLERGEN_LABELS: Record<string, ReturnType<typeof L>> = {
  gluten: L('Սնձան', 'Глютен', 'Gluten'),
  milk: L('Կաթ', 'Молоко', 'Milk'),
  egg: L('Ձու', 'Яйцо', 'Egg'),
  sesame: L('Քնջութ', 'Кунжут', 'Sesame'),
  mustard: L('Մանանեխ', 'Горчица', 'Mustard'),
  nuts: L('Ընկույզ', 'Орехи', 'Nuts'),
  soy: L('Սոյա', 'Соя', 'Soy'),
  celery: L('Նեխուր', 'Сельдерей', 'Celery'),
}

const fields: Field[] = [
  { name: 'name', label: L('Անուն', 'Название', 'Name'), type: 'text', localized: true, required: true },
  { name: 'category', label: L('Կատեգորիա', 'Категория', 'Category'), type: 'relationship', relationTo: 'categories', required: true },
  { name: 'description', label: L('Նկարագրություն', 'Описание', 'Description'), type: 'textarea', localized: true },
  {
    name: 'ingredients',
    label: L('Բաղադրություն', 'Состав', 'Ingredients'),
    type: 'text',
    localized: true,
    admin: { description: L('Ստորակետով', 'Через запятую', 'Comma-separated') },
  },
  {
    type: 'row',
    fields: [
      { name: 'price', label: L('Գին, ֏', 'Цена, ֏', 'Price, ֏'), type: 'number', required: true, min: 0 },
      { name: 'weight', label: L('Քաշ / ծավալ', 'Вес / объём', 'Weight / volume'), type: 'text', admin: { description: '350 g, 0.5 L' } },
      {
        name: 'order',
        label: L('Հերթականություն', 'Порядок', 'Order'),
        type: 'number',
        defaultValue: 0,
        admin: { description: L('Փոքր թիվը՝ վերևում', 'Меньше — выше', 'Smaller shows first') },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'available',
        label: L('Այսօր կա', 'Есть сегодня', 'Available today'),
        type: 'checkbox',
        defaultValue: true,
        admin: { description: L('Հանեք նշումը, երբ վերջացել է (stop-list)', 'Снимите, когда закончилось (стоп-лист)', 'Untick when sold out (stop-list)') },
      },
      { name: 'spicy', label: L('Կծու', 'Острое', 'Spicy'), type: 'checkbox', defaultValue: false },
      { name: 'signature', label: L('Մատադորի ընտրությունը', 'Выбор Матадора', "Matador's pick"), type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'row',
    fields: [
      { name: 'containsPork', label: L('Խոզի միս', 'Свинина', 'Pork'), type: 'checkbox', defaultValue: false },
      { name: 'vegetarian', label: L('Բուսակերային', 'Вегетарианское', 'Vegetarian'), type: 'checkbox', defaultValue: false },
    ],
  },
  {
    name: 'allergens',
    label: L('Ալերգեններ', 'Аллергены', 'Allergens'),
    type: 'select',
    hasMany: true,
    options: ALLERGENS.map((a) => ({ label: ALLERGEN_LABELS[a], value: a })),
  },
  {
    name: 'optionGroups',
    label: L('Ընտրություններ', 'Варианты', 'Choices'),
    labels: { singular: L('Խումբ', 'Группа', 'Group'), plural: L('Խմբեր', 'Группы', 'Groups') },
    type: 'array',
    admin: {
      description: L(
        'Հաց (մեկը), սոուս (մեկը), «առանց…» կամ հավելումներ (մի քանիսը)։ Պարտադիր խմբի առաջին տարբերակն ընտրված է ի սկզբանե։',
        'Хлеб (один), соус (один), «без…» или добавки (несколько). Первый вариант обязательной группы выбран заранее.',
        'Bread (one of), sauce (one of), "without…" or extras (several). The first option of a required group is preselected.',
      ),
    },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'name', label: L('Խմբի անուն', 'Название группы', 'Group name'), type: 'text', localized: true, required: true },
          { name: 'multi', label: L('Կարելի է մի քանիսը', 'Можно несколько', 'Several allowed'), type: 'checkbox', defaultValue: false },
          { name: 'required', label: L('Պարտադիր', 'Обязательно', 'Required'), type: 'checkbox', defaultValue: false },
        ],
      },
      {
        name: 'options',
        label: L('Տարբերակներ', 'Варианты', 'Options'),
        type: 'array',
        minRows: 1,
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'name', label: L('Անուն', 'Название', 'Name'), type: 'text', localized: true, required: true },
              {
                name: 'price',
                label: L('Հավելավճար, ֏', 'Доплата, ֏', 'Extra, ֏'),
                type: 'number',
                defaultValue: 0,
                min: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'photo',
    label: L('Լուսանկար', 'Фото', 'Photo'),
    type: 'upload',
    relationTo: 'media',
    admin: { description: L('Իրական լուսանկար, փոխարինում է գծանկարը', 'Настоящее фото, заменяет рисунок', 'A real photo; replaces the drawing') },
  },
  {
    name: 'art',
    label: L('Գծանկար', 'Рисунок', 'Drawing'),
    type: 'select',
    defaultValue: 'burger',
    options: ART_KINDS.map((k) => ({ label: k, value: k })),
    admin: { description: L('Երբ լուսանկար չկա', 'Когда нет фото', 'Used when there is no photo') },
  },
]

export const Dishes: CollectionConfig = {
  slug: 'dishes',
  labels: { singular: L('Ուտեստ', 'Блюдо', 'Dish'), plural: L('Ուտեստներ', 'Блюда', 'Dishes') },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'price', 'available'], listSearchableFields: ['name'] },
  access: { read: () => true, create: manager, update: staff, delete: manager },
  versions: { maxPerDoc: 20 },
  defaultSort: 'order',
  // the kitchen may only switch availability (stop-list); everything else is the manager's
  fields: lockFields(fields, notKitchen, ['available']),
}
