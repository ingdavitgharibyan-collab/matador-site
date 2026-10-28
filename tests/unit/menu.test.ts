import { expect, it } from 'vitest'

import type { MenuDish } from '@/lib/data'
import { defaultOpts, lineKey, lineLabel, needsChoice, unitPrice, validOpts } from '@/lib/menu'

const dish: MenuDish = {
  id: '1',
  name: 'Chicken shawarma',
  description: '',
  ingredients: '',
  price: 1500,
  weight: '',
  spicy: false,
  signature: false,
  available: true,
  art: 'shawarma',
  photo: null,
  category: 'shawarma',
  containsPork: false,
  vegetarian: false,
  allergens: [],
  optionGroups: [
    { id: 'g1', name: 'Bread', multi: false, required: true, options: [{ id: 'lav', name: 'Lavash', price: 0 }, { id: 'pit', name: 'Pita', price: 0 }] },
    { id: 'g2', name: 'Without', multi: true, required: false, options: [{ id: 'on', name: 'onion', price: 0 }, { id: 'tom', name: 'tomato', price: 0 }] },
    { id: 'g3', name: 'Extra', multi: true, required: false, options: [{ id: 'ch', name: 'Cheddar', price: 300 }] },
  ],
}

it('preselects required one-of groups and asks for a choice', () => {
  expect(defaultOpts(dish)).toEqual(['lav'])
  expect(needsChoice(dish)).toBe(true)
})
it('keeps one option per one-of group, drops unknown ids, fills required defaults', () => {
  expect(validOpts(dish, ['pit', 'lav', 'on', 'ghost'])).toEqual(['pit', 'on'])
  expect(validOpts(dish, [])).toEqual(['lav'])
})
it('prices and labels a line with its choices', () => {
  const opts = ['pit', 'on', 'ch']
  expect(unitPrice(dish, opts)).toBe(1800)
  expect(lineLabel(dish, opts)).toBe('Chicken shawarma (Bread: pita; Without: onion; Extra: cheddar)')
  expect(lineKey('1', ['on', 'pit'])).toBe(lineKey('1', ['pit', 'on']))
})
