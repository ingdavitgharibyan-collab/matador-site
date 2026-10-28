import { expect, it } from 'vitest'

import { businessDayStart } from '@/lib/hours'
import { kitchenKeyboard, kitchenText } from '@/lib/telegram'

const order = {
  id: 7,
  ref: 'M-2810-007',
  status: 'new',
  mode: 'delivery',
  zone: 'Kentron, 30–45′',
  name: 'Ani',
  phone: '+374 99 123456',
  address: 'Komitas 12',
  flat: 'apt 18',
  note: 'call, the intercom is broken',
  payment: 'cash',
  lines: [{ qty: 2, label: 'Shawarma plate (Meat: beef; Without: onion)', unit: 2900 }],
  subtotal: 5800,
  fee: 500,
  total: 6300,
  createdAt: '2026-10-28T17:14:00.000Z',
}

it('the kitchen reads number, mode and time first, then dishes with choices, money, guest', () => {
  const text = kitchenText(order, 'en')
  expect(text.split('\n')[0]).toBe('M-2810-007 · DELIVERY · 21:14')
  expect(text).toContain('2× Shawarma plate (Meat: beef; Without: onion)')
  expect(text).toContain('TOTAL 6 300 ֏')
  expect(text).toContain('Payment: Cash')
  expect(text).toContain('Kentron, 30–45′, Komitas 12, apt 18')
})

it('status buttons follow the order: accept/reject, then ready/out, then delivered', () => {
  expect(JSON.stringify(kitchenKeyboard(order, 'en'))).toContain('s:7:accepted')
  expect(JSON.stringify(kitchenKeyboard({ ...order, status: 'accepted' }, 'en'))).toContain('s:7:out')
  expect(JSON.stringify(kitchenKeyboard({ ...order, status: 'accepted', mode: 'pickup' }, 'en'))).not.toContain('s:7:out')
  expect(kitchenKeyboard({ ...order, status: 'delivered' }, 'en')).toEqual([])
})

it('the business day runs 06:00 → 06:00 Yerevan, so a night shift keeps one numbering', () => {
  expect(businessDayStart(new Date('2026-10-29T01:30:00+04:00')).toISOString()).toBe('2026-10-28T02:00:00.000Z')
  expect(businessDayStart(new Date('2026-10-29T07:00:00+04:00')).toISOString()).toBe('2026-10-29T02:00:00.000Z')
})
